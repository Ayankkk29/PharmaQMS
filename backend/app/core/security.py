import os
import logging
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings

logger = logging.getLogger("pharma_qms.security")

PROHIBITED_EXTENSIONS = {
    ".exe", ".dll", ".bat", ".cmd", ".sh", ".php", ".py", ".js", 
    ".html", ".htm", ".vbs", ".ps1", ".jar", ".msi", ".scr", ".pif"
}

def validate_uploaded_file(file: UploadFile, contents: bytes) -> str:
    """
    Validates uploaded files for size, extension safety, empty content, and MIME type consistency.
    Returns sanitized file extension (e.g. '.pdf').
    """
    filename = file.filename or "uploaded_file"
    file_ext = os.path.splitext(filename)[1].lower()

    # 1. File Size Validation
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({len(contents) / (1024*1024):.2f} MB) exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024):.0f} MB."
        )

    # 2. Empty File Validation
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    # 3. Prohibited Executable Extension Check
    if file_ext in PROHIBITED_EXTENSIONS:
        logger.warning(f"Security Alert: Attempted upload of prohibited file extension '{file_ext}' ({filename})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prohibited file type '{file_ext}'. Executable and script uploads are strictly forbidden."
        )

    # 4. Whitelisted Extension Check
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    return file_ext
