from sqlmodel import SQLModel, Field


class RoleSkillBase(SQLModel):
    role_id: int = Field(foreign_key="role.id", primary_key=True)
    skill_id: int = Field(foreign_key="skill.id", primary_key=True)
    required_level: int = Field(default=1, ge=1, le=5)
    importance: int = Field(default=1, ge=1, le=5)


class RoleSkill(RoleSkillBase, table=True):
    pass


class RoleSkillCreate(SQLModel):
    skill_id: int
    required_level: int = 1
    importance: int = 1


class RoleSkillRead(RoleSkillBase):
    pass
