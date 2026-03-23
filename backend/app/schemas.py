from pydantic import BaseModel


class MessageIn(BaseModel):
    message: str


class AdminLogin(BaseModel):
    password: str
