# Version Effectivity Design

## Core Rule

Current and future-effective statutory text must be version-partitioned. Do not collapse variants such as "effective until" and "effective on" into one current rule.

This is especially important for high-risk provisions, including termination of parental rights sections. A future-effective version served as current law would be a judicial integrity failure.

## Data Model

Use `authority_units` for the stable citation and `authority_versions` for each version of the text.

Example model:

| Concept | Table |
|---|---|
| Tennessee Code section as a stable citation | `authority_units` |
| Current version of that section | `authority_versions` row |
| Future-effective version of that section | separate `authority_versions` row |
| Expired or superseded version | separate `authority_versions` row |
| Text chunks belonging to a version | `authority_chunks` |

## Fields

`authority_versions` must include:

- `valid_from`
- `valid_to`
- `effective_label`
- `source_version_label`
- `authority_version_label`
- `version_status`
- `supersedes_authority_version_id`
- `superseded_by_authority_version_id`
- `has_effective_date_warning`
- `requires_effectivity_qa`

`valid_to` should be exclusive. A version is valid on an as-of date when:

```sql
valid_from <= :as_of_date
and (valid_to is null or :as_of_date < valid_to)
```

## Representing Current Text

Current text should have:

- `version_status = current`
- `valid_from` set to the known effective date when available
- `valid_to` null unless a future switchover date is known
- `requires_effectivity_qa = false` only after date parsing and review pass

When a current version is explicitly effective until a date, set `valid_to` to that date and link `superseded_by_authority_version_id` to the future version if the future version is present.

## Representing Future-Effective Text

Future-effective text should have:

- `version_status = future_effective`
- `valid_from` set to the effective date
- `valid_to` null unless another successor is already known
- `supersedes_authority_version_id` pointing to the current version when known
- `requires_effectivity_qa = true` until reviewed

Future-effective rows may be stored and indexed, but production current-law retrieval must exclude them unless the user asks for future law or the as-of date reaches the future effective date.

## Representing Expired Or Superseded Text

Expired or superseded text should have:

- `version_status = expired` or `superseded`
- `valid_to` populated
- successor relationship populated when known
- display and retrieval excluded from current-law mode

Superseded text may be retrievable only in explicit historical or QA modes.

## Preventing Future Text From Serving As Current Law

Production retrieval must always require an as-of date. The default should be the request date in the court's configured timezone.

Required filters:

```sql
where v.version_status = 'current'
  and v.valid_from <= :as_of_date
  and (v.valid_to is null or :as_of_date < v.valid_to)
```

If a future-effective version exists for the same authority unit, the answer package should include metadata that lets the model state that a future version exists without using it as current authority.

## As-Of Date Query

Use a function or view that accepts `as_of_date`, `retrieval_mode`, and filters. Do not let application code hand-roll version predicates in several places.

Pseudo-query:

```sql
select c.*
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
where c.authority_unit_id = :authority_unit_id
  and c.approval_status = 'approved_for_production'
  and c.production_display_status in ('displayable_black_letter', 'displayable_policy_text')
  and v.valid_from <= :as_of_date
  and (v.valid_to is null or :as_of_date < v.valid_to);
```

## Multiple Effective Versions Alert

When a query hits an authority unit with more than one version, retrieval should return:

- the current as-of-date version for answer generation
- a machine-readable `has_other_effective_versions = true`
- the future effective date and label as metadata, not answer text unless requested
- an audit flag on the retrieval log

The UI or answer formatter should display a restrained notice such as: "This citation has another effective version. The answer used the version current as of [date]."

## QA For High-Risk Sections

Sections involving termination of parental rights, dependency and neglect, custody, removal, detention, and appeal deadlines should be QA-prioritized.

Required QA checks:

- paired current/future versions have the same `authority_unit_id`
- current version valid range ends before future version begins
- no date overlap exists unless explicitly approved
- no gap exists unless the law actually has a gap
- future-effective text is excluded from current-law queries
- restricted annotations and case notes tied to the section remain display-blocked
- answer tests query the section before and after the effective date

## Blockers To Promotion

Do not approve a build for production if:

- any effective-dated unit is loaded with `version_status = current` for all variants
- any future-effective black-letter chunk appears in a current-law retrieval result before its effective date
- any current/future pair cannot be tied to one authority unit
- any high-risk effective-dated section lacks manual QA signoff

