"""
MinIO/S3 Storage Service for proof file uploads
"""
from typing import Optional, Dict, Any
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, status, UploadFile
import magic
from app.core.config import settings
import io
import uuid
from datetime import datetime, timedelta


class StorageService:
    """Service for MinIO/S3 file operations with security checks"""
    
    def __init__(self):
        self.s3_client = None
        self._initialize_s3_client()
    
    def _initialize_s3_client(self):
        """Initialize S3 client with MinIO configuration"""
        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                config=Config(signature_version='s3v4'),
                region_name=settings.S3_REGION
            )
            # Ensure bucket exists
            self._ensure_bucket_exists()
        except NoCredentialsError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="S3 credentials not configured"
            )
    
    def _ensure_bucket_exists(self):
        """Ensure the S3 bucket exists, create if not"""
        try:
            self.s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        except ClientError:
            # Bucket doesn't exist, create it
            try:
                self.s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
            except ClientError as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create bucket: {str(e)}"
                )
    
    def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate file type and size"""
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB"
            )
        
        # Check file type using magic
        file_content = file.file.read(1024)
        file.file.seek(0)
        
        mime_type = magic.from_buffer(file_content, mime=True)
        if mime_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {mime_type} not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}"
            )
        
        return {
            "size": file_size,
            "mime_type": mime_type,
            "valid": True
        }
    
    async def upload_file(self, file: UploadFile, dispute_id: int, user_id: int) -> Dict[str, Any]:
        """Upload a file to S3 with validation and virus scan stub"""
        # Validate file
        validation = self.validate_file(file)
        
        # Virus scan stub (would integrate with ClamAV or similar)
        virus_scan_result = self._scan_file_for_viruses(file)
        if not virus_scan_result["clean"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File failed virus scan: " + virus_scan_result.get("reason", "Suspicious content")
            )
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"proofs/{dispute_id}/{user_id}/{uuid.uuid4()}"
        if file_extension:
            unique_filename += f".{file_extension}"
        
        try:
            # Upload file to S3
            file.file.seek(0)
            self.s3_client.upload_fileobj(
                file.file,
                settings.S3_BUCKET_NAME,
                unique_filename,
                ExtraArgs={
                    'ContentType': validation['mime_type'],
                    'Metadata': {
                        'dispute_id': str(dispute_id),
                        'user_id': str(user_id),
                        'original_filename': file.filename,
                        'uploaded_at': datetime.utcnow().isoformat()
                    }
                }
            )
            
            # Generate presigned URL for access
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.S3_BUCKET_NAME,
                    'Key': unique_filename
                },
                ExpiresIn=3600 * 24 * 7  # 7 days
            )
            
            return {
                "file_url": f"s3://{settings.S3_BUCKET_NAME}/{unique_filename}",
                "presigned_url": presigned_url,
                "filename": unique_filename,
                "size": validation['size'],
                "mime_type": validation['mime_type'],
                "dispute_id": dispute_id,
                "user_id": user_id
            }
            
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    def _scan_file_for_viruses(self, file: UploadFile) -> Dict[str, Any]:
        """Stub for virus scanning - would integrate with ClamAV or similar"""
        # This is a stub implementation
        # In production, integrate with ClamAV, AWS S3 Object Lambda, or similar
        
        # Simple heuristic checks (stub)
        file.file.seek(0)
        content = file.file.read(1024)
        file.file.seek(0)
        
        # Check for common malicious patterns (very basic stub)
        suspicious_patterns = [
            b'\x4d\x5a',  # MZ header (Windows executable)
            b'\x7fELF',   # ELF header (Linux executable)
        ]
        
        for pattern in suspicious_patterns:
            if pattern in content:
                return {
                    "clean": False,
                    "reason": "Executable file detected"
                }
        
        return {
            "clean": True,
            "reason": "File appears clean"
        }
    
    def delete_file(self, filename: str) -> bool:
        """Delete a file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=filename
            )
            return True
        except ClientError:
            return False
    
    def generate_presigned_url(self, filename: str, expires_in: int = 3600) -> Optional[str]:
        """Generate presigned URL for file access"""
        try:
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.S3_BUCKET_NAME,
                    'Key': filename
                },
                ExpiresIn=expires_in
            )
        except ClientError:
            return None


# Global storage service instance - lazy initialization
storage_service = None

def get_storage_service():
    """Get or create the storage service instance with lazy initialization"""
    global storage_service
    if storage_service is None:
        storage_service = StorageService()
    return storage_service