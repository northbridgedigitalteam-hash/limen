const Storage = {
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  appendSession(session) {
    const history = Storage.get('sessionHistory') || [];
    history.push(session);
    Storage.set('sessionHistory', history);
  }
};
