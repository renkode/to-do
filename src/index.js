import './style.css';
import Sortable from 'sortablejs';
import { projectManager } from './projectManager';
import { taskManager } from './taskManager';
import DOMManager from './DOMManager';

projectManager.loadProjects();
taskManager.loadTasks();
DOMManager.addExistingProjects();
DOMManager.addExistingTasks();
DOMManager.populateProjectDropDown();
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
