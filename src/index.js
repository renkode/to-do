

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import './colors.css';
import '../node_modules/jquery/dist/jquery.slim.min.js';
import '../node_modules/popper.js/dist/umd/popper.min.js';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';

import Sortable from 'sortablejs';
import { projectManager } from './projectManager';
import { taskManager } from './taskManager';
import DOMManager from './DOMManager';

projectManager.loadProjects();
taskManager.loadTasks();
DOMManager.loadAll();
Sortable.create(DOMManager.taskList, {
  animation: 150,
  ghostClass: 'blue-background-class',
  group: 'localStorage-example',
  store: {
    get(sortable) {
      const order = localStorage.getItem(sortable.options.group.name);
      return order ? order.split('|') : [];
    },
    set(sortable) {
      const order = sortable.toArray();
      localStorage.setItem(sortable.options.group.name, order.join('|'));
    },
  },
});
