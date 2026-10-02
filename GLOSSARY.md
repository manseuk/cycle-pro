# Cycling Training

This domain helps road cyclists review their riding and work toward an event or general-fitness outcome.

## People

**Cyclist**:
A person who uses the app to track their road cycling and training. Each Cyclist has a private set of rides, goals, and training data.

## Goals

**Training goal**:
A user's chosen outcome that guides training suggestions.

**Event goal**:
A training goal tied to a named event and date. Its default outcome is completing the event; the user may also set a target finish time.

**General-fitness goal**:
A training goal measured by a weekly riding-frequency or riding-time target, with an optional power target such as FTP.

**Primary active goal**:
The single active training goal that the app uses to orient its suggestions for a user.

## Ride data

**Ride**:
A completed road-cycling session imported into a user's account from a FIT file.

**FIT file**:
The activity-data file a user uploads to create a Ride. For the POC, discard it after successful import; the parsed ride data remains.

## Training load

**Chronic Training Load (CTL)**:
A longer-term weighted average of daily training stress, commonly calculated with a 42-day time constant. It describes a relative training-load trend, not an absolute fitness or readiness score.

**Acute Training Load (ATL)**:
A shorter-term weighted average of daily training stress, commonly calculated with a 7-day time constant. It describes a relative recent-load trend, not an absolute fatigue score.

**Relative load**:
The app's daily training-stress estimate: moving time (hours) × (average power ÷ FTP in effect that day)² × 100. It uses average power rather than normalized power, so variable rides such as races and intervals score lower than their physiological cost. CTL and ATL start from zero at the first scored Ride, so early trend values understate real load. Switching to normalized power is a possible follow-up, not current behaviour.

**Training Stress Balance (TSB)**:
The previous day's CTL minus ATL, describing the relative balance between longer-term and recent training load. It is not a standalone predictor of performance or readiness.

**Functional Threshold Power (FTP)**:
A cyclist's current power threshold estimate used to interpret ride power relative to their capacity. The estimate can change over time and affects power-based training-load calculations.
