"""Independent TS catalogue comparison, including status and nested codes."""

import re
from pathlib import Path

import pytest

from genetics.shared_kernel.domain import errors

pytestmark = pytest.mark.unit


def shared_codes() -> str:
    return (Path(__file__).resolve().parents[4] / "packages/shared/src/codes.ts").read_text()


def test_error_codes_match_shared():
    expected = {
        code: int(status)
        for code, status in re.findall(r"^  (\w+): (\d+),$", shared_codes(), re.MULTILINE)
    }
    assert expected
    assert errors.ERROR_CODES == expected


@pytest.mark.parametrize(
    ("section", "actual"),
    [("BLOCKER_CODES", errors.BLOCKER_CODES), ("FIELD_ERROR_CODES", errors.FIELD_ERROR_CODES)],
)
def test_nested_codes_match_shared(section, actual):
    body = shared_codes().split(f"export const {section} = [", 1)[1].split("] as const", 1)[0]
    assert set(actual) == set(re.findall(r"'([^']+)'", body))


def test_python_only_code_is_detected(monkeypatch):
    monkeypatch.setitem(errors.ERROR_CODES, "python_only_probe", 409)
    with pytest.raises(AssertionError):
        test_error_codes_match_shared()


def test_every_catalogue_code_has_a_subclass():
    assert {cls.code for cls in errors.DomainError.__subclasses__()} == set(errors.ERROR_CODES)
