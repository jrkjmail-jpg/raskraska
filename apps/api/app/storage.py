from io import BytesIO
import json
from uuid import uuid4

import boto3

from app.config import get_settings


class Storage:
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.s3_bucket
        self.public_base_url = settings.s3_public_base_url.rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    def ensure_bucket(self) -> None:
        existing = [bucket["Name"] for bucket in self.client.list_buckets().get("Buckets", [])]
        if self.bucket not in existing:
            self.client.create_bucket(Bucket=self.bucket)
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{self.bucket}/*"],
                }
            ],
        }
        try:
            self.client.put_bucket_policy(Bucket=self.bucket, Policy=json.dumps(policy))
        except Exception:
            pass

    def put_bytes(self, key: str, data: bytes, content_type: str) -> str:
        self.ensure_bucket()
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data, ContentType=content_type)
        return key

    def get_bytes(self, key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        body = response["Body"]
        try:
            return body.read()
        finally:
            body.close()

    def public_url(self, key: str | None) -> str | None:
        if not key:
            return None
        return f"{self.public_base_url}/{key}"


def make_object_key(prefix: str, extension: str) -> str:
    return f"{prefix}/{uuid4()}.{extension.lstrip('.')}"


def bytes_io(data: bytes) -> BytesIO:
    return BytesIO(data)
