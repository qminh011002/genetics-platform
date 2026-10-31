"""Stable error catalogue (api-standards §7). Domain stays framework independent."""

from __future__ import annotations

ERROR_CODES: dict[str, int] = {
    "bad_request": 400,
    "unauthenticated": 401,
    "token_expired": 401,
    "account_pending": 403,
    "platform_not_allowed": 403,
    "permission_denied": 403,
    "not_found": 404,
    "batch_closed": 409,
    "gate_not_met": 409,
    "dq_blocking": 409,
    "duplicate_code": 409,
    "duplicate_id": 409,
    "has_children": 409,
    "generation_not_latest": 409,
    "invalid_transition": 409,
    "assignee_lacks_permission": 409,
    "idempotency_key_reused": 409,
    "import_not_validated": 409,
    "import_undo_expired": 409,
    "version_conflict": 412,
    "payload_too_large": 413,
    "unsupported_media_type": 415,
    "validation_failed": 422,
    "reason_required": 422,
    "edit_window_expired": 422,
    "precondition_required": 428,
    "rate_limited": 429,
    "internal_error": 500,
    "service_unavailable": 503,
}

BLOCKER_CODES = (
    "missing_population_size",
    "missing_sexing",
    "missing_egg_collection",
    "missing_egg_weighing",
    "pending_individuals",
    "missing_neonate_harvest",
    "missing_neonate_weighing",
    "missing_conditions",
    "missing_larvae_observation",
    "missing_pupae_sample",
    "branch_required",
    "dq_errors_open",
)

FIELD_ERROR_CODES = (
    "required",
    "out_of_range",
    "outside_batch_dates",
    "invalid_format",
    "unknown_reference",
    "duplicate_record",
    "not_latest_generation",
)


class DomainError(Exception):
    """Stable code and safe, explicitly supplied response extensions."""

    code = "internal_error"

    def __init__(
        self,
        code: str | None = None,
        *,
        detail: str | None = None,
        errors: list[dict[str, object]] | None = None,
        blockers: list[dict[str, object]] | None = None,
        required_permission: str | None = None,
        scope: str | None = None,
        current_version: int | None = None,
        allowed: list[str] | None = None,
    ) -> None:
        self.code = code if code is not None else type(self).code
        self.status = ERROR_CODES[self.code]
        self.detail = detail
        self.errors = errors
        self.blockers = blockers
        self.required_permission = required_permission
        self.scope = scope
        self.current_version = current_version
        self.allowed = allowed
        super().__init__(self.code)


class BadRequest(DomainError):
    code = "bad_request"


class Unauthenticated(DomainError):
    code = "unauthenticated"


class TokenExpired(DomainError):
    code = "token_expired"


class AccountPending(DomainError):
    code = "account_pending"


class PlatformNotAllowed(DomainError):
    code = "platform_not_allowed"


class PermissionDenied(DomainError):
    code = "permission_denied"


class NotFound(DomainError):
    code = "not_found"


class BatchClosed(DomainError):
    code = "batch_closed"


class GateNotMet(DomainError):
    code = "gate_not_met"


class DqBlocking(DomainError):
    code = "dq_blocking"


class DuplicateCode(DomainError):
    code = "duplicate_code"


class DuplicateId(DomainError):
    code = "duplicate_id"


class HasChildren(DomainError):
    code = "has_children"


class GenerationNotLatest(DomainError):
    code = "generation_not_latest"


class InvalidTransition(DomainError):
    code = "invalid_transition"


class AssigneeLacksPermission(DomainError):
    code = "assignee_lacks_permission"


class IdempotencyKeyReused(DomainError):
    code = "idempotency_key_reused"


class ImportNotValidated(DomainError):
    code = "import_not_validated"


class ImportUndoExpired(DomainError):
    code = "import_undo_expired"


class VersionConflict(DomainError):
    code = "version_conflict"


class PayloadTooLarge(DomainError):
    code = "payload_too_large"


class UnsupportedMediaType(DomainError):
    code = "unsupported_media_type"


class ValidationFailed(DomainError):
    code = "validation_failed"


class ReasonRequired(DomainError):
    code = "reason_required"


class EditWindowExpired(DomainError):
    code = "edit_window_expired"


class PreconditionRequired(DomainError):
    code = "precondition_required"


class RateLimited(DomainError):
    code = "rate_limited"


class InternalError(DomainError):
    code = "internal_error"


class ServiceUnavailable(DomainError):
    code = "service_unavailable"
