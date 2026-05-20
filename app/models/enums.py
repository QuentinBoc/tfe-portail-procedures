from enum import Enum


class ReportType(str, Enum):
    REFUSAL = "refusal"
    PROBLEM = "problem"
    CLOSURE = "closure"