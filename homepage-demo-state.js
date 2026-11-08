export const services = Object.freeze({ towels: 'Fresh towels', cleaning: 'Room cleaning', maintenance: 'Maintenance help' });

export function initialState() {
  return { dnd: false, nextId: 1, requests: [] };
}

// This simulation holds only sample data in memory; it has no network or storage access.
export function transition(state, action) {
  const unchanged = message => ({ state, message });
  if (action.type === 'reset') return { state: initialState(), message: 'Demo reset. Choose a service to begin.' };
  if (action.type === 'toggle-dnd') {
    const dnd = !state.dnd;
    return { state: { ...state, dnd }, message: dnd ? 'Do Not Disturb is on. Cleaning is paused; towels and maintenance can still be requested.' : 'Do Not Disturb is off. Cleaning can continue.' };
  }
  if (action.type === 'send') {
    if (!Object.hasOwn(services, action.service)) return unchanged('Choose one of the listed services.');
    if (action.service === 'cleaning' && state.dnd) return unchanged('Turn off Do Not Disturb before requesting cleaning.');
    if (state.requests.some(r => r.service === action.service && r.status !== 'done')) return unchanged('That request is already in the staff queue.');
    if (state.requests.length >= 12) return unchanged('This sample queue is full. Reset the demo to start again.');
    const request = { id: state.nextId, service: action.service, status: 'pending' };
    return { state: { ...state, nextId: state.nextId + 1, requests: [...state.requests, request] }, message: 'Sample request added. Try accepting it in the staff queue.' };
  }
  if (action.type === 'advance') {
    const request = state.requests.find(r => r.id === action.id);
    if (!request || request.status === 'done') return unchanged('There is no active request to update.');
    if (request.service === 'cleaning' && state.dnd) return unchanged('Cleaning is paused while Do Not Disturb is on.');
    const status = request.status === 'pending' ? 'accepted' : 'done';
    return { state: { ...state, requests: state.requests.map(r => r.id === action.id ? { ...r, status } : r) }, message: status === 'accepted' ? 'The staff view accepted the sample request. The guest can see the update.' : 'Sample request completed. Both views now show Done.' };
  }
  return unchanged('Choose a demo action to continue.');
}
