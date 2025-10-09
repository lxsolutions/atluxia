







import click
from ..utils import api_client

@click.command()
@click.argument('job_id')
def status(job_id):
    """Check the status of a job."""
    try:
        # In a real implementation, we would call the coordinator API
        response = {
            "jobId": job_id,
            "status": "pending",
            "providersAssigned": ["provider1", "provider2"],
            "progress": 0.35
        }

        click.echo(f"Job {job_id} status:")
        click.echo(f"- Status: {response['status']}")
        click.echo(f"- Progress: {response['progress'] * 100:.1f}%")
        if response.get('providersAssigned'):
            click.echo("- Providers assigned:")
            for provider in response['providersAssigned']:
                click.echo(f"  - {provider}")
    except Exception as e:
        click.echo(f"Error getting job status: {e}", err=True)




