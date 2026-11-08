import { initialState, services, transition } from './homepage-demo-state.js';

let state = initialState();
const byId = id => document.getElementById(id);
const nodes = {
  service: byId('demo-service'), send: byId('demo-send'), dnd: byId('demo-dnd'),
  reset: byId('demo-reset'), privacy: byId('demo-privacy'), feedback: byId('demo-feedback'),
  guest: byId('guest-requests'), staff: byId('staff-requests')
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderRequests(target, staff) {
  target.replaceChildren();
  if (!state.requests.length) {
    target.append(element('p', 'empty-state', staff ? 'Requests from the guest view appear here.' : 'No sample requests yet.'));
    return;
  }
  for (const request of state.requests) {
    const paused = state.dnd && request.service === 'cleaning' && request.status !== 'done';
    const status = paused ? 'Paused · DND' : { pending: 'To confirm', accepted: 'Accepted', done: 'Done' }[request.status];
    const card = element('article', 'demo-request');
    const title = element('div', 'demo-request-title');
    title.append(element('strong', '', services[request.service]), element('span', 'demo-status', status));
    card.append(title, element('p', '', `Room 305 · sample request ${request.id}`));
    if (staff && request.status !== 'done') {
      const next = request.status === 'pending' ? 'Accept request' : 'Mark done';
      const button = element('button', 'btn', next);
      button.type = 'button';
      button.disabled = paused;
      button.setAttribute('aria-label', `${next}: ${services[request.service]} ${request.id}`);
      button.addEventListener('click', () => act({ type: 'advance', id: request.id }));
      card.append(button);
      if (paused) card.append(element('p', '', 'Wait until the guest turns off Do Not Disturb.'));
    }
    target.append(card);
  }
}

function render() {
  nodes.dnd.setAttribute('aria-pressed', String(state.dnd));
  nodes.dnd.textContent = `Do Not Disturb: ${state.dnd ? 'on' : 'off'}`;
  nodes.privacy.textContent = state.dnd ? 'Cleaning is paused. Staff must still follow entry procedures.' : 'Cleaning requests are available.';
  renderRequests(nodes.guest, false);
  renderRequests(nodes.staff, true);
}

function act(action) {
  const focus = document.activeElement;
  const label = focus?.getAttribute('aria-label');
  const wasStaff = nodes.staff.contains(focus);
  const result = transition(state, action);
  state = result.state;
  render();
  nodes.feedback.textContent = result.message;
  if (wasStaff) {
    const next = Array.from(nodes.staff.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === label || (action.id && b.getAttribute('aria-label').endsWith(` ${action.id}`)));
    if (next && !next.disabled) next.focus();
    else { nodes.feedback.tabIndex = -1; nodes.feedback.focus(); }
  }
}

nodes.send.disabled = nodes.dnd.disabled = nodes.reset.disabled = false;
nodes.send.addEventListener('click', () => act({ type: 'send', service: nodes.service.value }));
nodes.dnd.addEventListener('click', () => act({ type: 'toggle-dnd' }));
nodes.reset.addEventListener('click', () => act({ type: 'reset' }));
render();
