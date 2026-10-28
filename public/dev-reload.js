// Same-origin development refresh only. No external services are contacted.
const events = new EventSource('/__dev_events');
events.addEventListener('reload', () => location.reload());
