#!/usr/bin/env python3
"""
Seed script for EverPath database.
Populates initial data for roles, skills, quests, lessons, and job leads.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.quest import Quest, QuestType, QuestDifficulty
from app.models.lesson import Lesson
from app.models.assessment import Assessment, AssessmentType
from app.models.job_lead import JobLead
from app.core.security import get_password_hash


def seed_database():
    """Seed the database with initial data."""
    
    with Session(engine) as session:
        print("Seeding database...")
        
        # Create admin user
        admin_user = session.exec(select(User).where(User.email == "admin@everpath.com")).first()
        if not admin_user:
            admin_user = User(
                email="admin@everpath.com",
                hashed_password=get_password_hash("admin123"),
                age_band="25-34",
                role=UserRole.ADMIN
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)
            print("✓ Created admin user")
        
        # Seed skills
        skills_data = [
            # Technical Skills
            {"name": "Python Programming", "category": "Technical"},
            {"name": "JavaScript", "category": "Technical"},
            {"name": "HTML/CSS", "category": "Technical"},
            {"name": "SQL", "category": "Technical"},
            {"name": "Data Analysis", "category": "Technical"},
            {"name": "Machine Learning", "category": "Technical"},
            {"name": "Web Development", "category": "Technical"},
            {"name": "Mobile Development", "category": "Technical"},
            
            # Soft Skills
            {"name": "Communication", "category": "Soft Skills"},
            {"name": "Problem Solving", "category": "Soft Skills"},
            {"name": "Teamwork", "category": "Soft Skills"},
            {"name": "Leadership", "category": "Soft Skills"},
            {"name": "Time Management", "category": "Soft Skills"},
            {"name": "Critical Thinking", "category": "Soft Skills"},
            
            # Academic Skills
            {"name": "Mathematics", "category": "Academic"},
            {"name": "Reading Comprehension", "category": "Academic"},
            {"name": "Writing", "category": "Academic"},
            {"name": "Science", "category": "Academic"},
            {"name": "History", "category": "Academic"},
            
            # Creative Skills
            {"name": "Graphic Design", "category": "Creative"},
            {"name": "Video Editing", "category": "Creative"},
            {"name": "Music", "category": "Creative"},
            {"name": "Drawing", "category": "Creative"},
            
            # Trades Skills
            {"name": "Electrical Work", "category": "Trades"},
            {"name": "Plumbing", "category": "Trades"},
            {"name": "Carpentry", "category": "Trades"},
            {"name": "Cooking", "category": "Trades"},
        ]
        
        skills = {}
        for skill_data in skills_data:
            skill = session.exec(select(Skill).where(Skill.name == skill_data["name"])).first()
            if not skill:
                skill = Skill(**skill_data)
                session.add(skill)
                session.commit()
                session.refresh(skill)
            skills[skill_data["name"]] = skill
        print(f"✓ Seeded {len(skills)} skills")
        
        # Seed roles
        roles_data = [
            {"name": "Software Engineer", "category": "Technology", "min_age": 18},
            {"name": "Data Scientist", "category": "Technology", "min_age": 18},
            {"name": "Web Developer", "category": "Technology", "min_age": 18},
            {"name": "Mobile Developer", "category": "Technology", "min_age": 18},
            {"name": "Graphic Designer", "category": "Creative", "min_age": 16},
            {"name": "Teacher", "category": "Education", "min_age": 21},
            {"name": "Nurse", "category": "Healthcare", "min_age": 18},
            {"name": "Electrician", "category": "Trades", "min_age": 18},
            {"name": "Chef", "category": "Culinary", "min_age": 16},
            {"name": "Project Manager", "category": "Business", "min_age": 21},
        ]
        
        roles = {}
        for role_data in roles_data:
            role = session.exec(select(Role).where(Role.name == role_data["name"])).first()
            if not role:
                role = Role(**role_data)
                session.add(role)
                session.commit()
                session.refresh(role)
            roles[role_data["name"]] = role
        print(f"✓ Seeded {len(roles)} roles")
        
        # Seed role-skill relationships
        role_skills_data = {
            "Software Engineer": [
                ("Python Programming", 4, 5),
                ("JavaScript", 3, 4),
                ("SQL", 3, 4),
                ("Problem Solving", 4, 5),
                ("Teamwork", 3, 4),
            ],
            "Data Scientist": [
                ("Python Programming", 4, 5),
                ("SQL", 4, 5),
                ("Data Analysis", 4, 5),
                ("Machine Learning", 3, 4),
                ("Mathematics", 4, 5),
            ],
            "Teacher": [
                ("Communication", 5, 5),
                ("Leadership", 4, 4),
                ("Mathematics", 3, 3),
                ("Reading Comprehension", 4, 4),
                ("Writing", 4, 4),
            ],
            "Electrician": [
                ("Electrical Work", 4, 5),
                ("Problem Solving", 4, 5),
                ("Mathematics", 3, 4),
                ("Teamwork", 3, 3),
            ],
        }
        
        for role_name, skill_requirements in role_skills_data.items():
            role = roles[role_name]
            for skill_name, required_level, importance in skill_requirements:
                skill = skills[skill_name]
                role_skill = session.exec(
                    select(RoleSkill).where(
                        RoleSkill.role_id == role.id,
                        RoleSkill.skill_id == skill.id
                    )
                ).first()
                if not role_skill:
                    role_skill = RoleSkill(
                        role_id=role.id,
                        skill_id=skill.id,
                        required_level=required_level,
                        importance=importance
                    )
                    session.add(role_skill)
        session.commit()
        print("✓ Seeded role-skill relationships")
        
        # Seed quests
        quests_data = [
            {
                "title": "Write Your First Python Function",
                "type": QuestType.PRACTICE,
                "difficulty": QuestDifficulty.BEGINNER,
                "estimated_minutes": 30,
                "skill_id": skills["Python Programming"].id,
                "content": '{"instructions": "Write a function that takes two numbers and returns their sum.", "hint": "Use the def keyword to define a function."}'
            },
            {
                "title": "Create a Simple Calculator",
                "type": QuestType.MINI_PROJECT,
                "difficulty": QuestDifficulty.INTERMEDIATE,
                "estimated_minutes": 60,
                "skill_id": skills["Python Programming"].id,
                "content": '{"instructions": "Build a calculator that can add, subtract, multiply, and divide.", "requirements": ["Use functions", "Handle user input", "Display results"]}'
            },
            {
                "title": "Basic Math Quiz",
                "type": QuestType.ASSESSMENT,
                "difficulty": QuestDifficulty.BEGINNER,
                "estimated_minutes": 15,
                "skill_id": skills["Mathematics"].id,
                "content": '{"instructions": "Answer 10 basic math questions.", "time_limit": 15}'
            },
        ]
        
        for quest_data in quests_data:
            quest = session.exec(select(Quest).where(Quest.title == quest_data["title"])).first()
            if not quest:
                quest = Quest(**quest_data)
                session.add(quest)
        session.commit()
        print("✓ Seeded quests")
        
        # Seed lessons
        lessons_data = [
            {
                "title": "Introduction to Python",
                "topics": "Python Programming, Programming Basics",
                "body_md": "# Introduction to Python\n\nPython is a versatile programming language...",
                "estimated_minutes": 45,
            },
            {
                "title": "Basic Mathematics",
                "topics": "Mathematics, Arithmetic",
                "body_md": "# Basic Mathematics\n\nLearn fundamental math concepts...",
                "estimated_minutes": 60,
            },
        ]
        
        for lesson_data in lessons_data:
            lesson = session.exec(select(Lesson).where(Lesson.title == lesson_data["title"])).first()
            if not lesson:
                lesson = Lesson(**lesson_data)
                session.add(lesson)
        session.commit()
        print("✓ Seeded lessons")
        
        # Seed assessments
        assessments_data = [
            {
                "type": AssessmentType.QUIZ,
                "skill_id": skills["Python Programming"].id,
                "title": "Python Basics Quiz",
                "description": "Test your knowledge of Python fundamentals",
            },
            {
                "type": AssessmentType.QUIZ,
                "skill_id": skills["Mathematics"].id,
                "title": "Math Fundamentals Assessment",
                "description": "Assess your math skills",
            },
        ]
        
        for assessment_data in assessments_data:
            assessment = session.exec(
                select(Assessment).where(Assessment.title == assessment_data["title"])
            ).first()
            if not assessment:
                assessment = Assessment(**assessment_data)
                session.add(assessment)
        session.commit()
        print("✓ Seeded assessments")
        
        # Seed job leads
        job_leads_data = [
            {
                "provider": "mock",
                "title": "Junior Python Developer",
                "company": "TechCorp Inc.",
                "location": "San Francisco, CA",
                "skills": "Python Programming, SQL, Problem Solving",
                "role_id": roles["Software Engineer"].id,
            },
            {
                "provider": "mock",
                "title": "Data Analyst",
                "company": "DataWorks LLC",
                "location": "Remote",
                "skills": "Data Analysis, SQL, Python Programming",
                "role_id": roles["Data Scientist"].id,
            },
        ]
        
        for job_data in job_leads_data:
            job_lead = session.exec(
                select(JobLead).where(
                    JobLead.title == job_data["title"],
                    JobLead.company == job_data["company"]
                )
            ).first()
            if not job_lead:
                job_lead = JobLead(**job_data)
                session.add(job_lead)
        session.commit()
        print("✓ Seeded job leads")
        
        print("\n✅ Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()