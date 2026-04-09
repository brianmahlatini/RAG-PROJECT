# pyright: reportMissingImports=false, reportMissingTypeStubs=false
# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false
# File: logging_config.py
# Purpose: Standard logging configuration used across the backend.
# Overview:
# - Sets log level based on ENVIRONMENT
# - Sends logs to stdout
import logging
import sys

from app.core.config import ENVIRONMENT


def configure_logging() -> None:
    level = logging.INFO if ENVIRONMENT == "production" else logging.DEBUG
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Silence noisy libraries in development
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
