from datetime import datetime

class EventLog:
    def __init__(self, max_events=100):
        self.events = []
        self.max_events = max_events

    def add_event(self, message: str, level: str = "INFO", details: dict = None):
        event = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "details": details or {}
        }
        self.events.append(event)
        if len(self.events) > self.max_events:
            self.events.pop(0)

    def get_events(self):
        return self.events

event_log = EventLog()
