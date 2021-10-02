import Task from './task';

export default class TaskManager {
  constructor() {
    this.tasks = [];
    this.editingTask = '';
    this.targetId = '';
  }

  generateID() {
    return `_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadTasks() {
    const tasks = JSON.parse(window.localStorage.getItem('tasks'));
    if (!tasks) return;
    for (const task of tasks) {
      this.tasks.push(task);
    }
  }

  saveTasks() {
    window.localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  createTask(project, title, description, date) {
    const task = new Task(project, this.generateID(), title, description, date);
    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  updateTask(task, project, title, description, date) {
    task.project = project;
    task.title = title;
    task.description = description;
    task.date = date;
    this.saveTasks();
  }

  deleteTask(id) {
    const index = this.tasks.map((e) => e.id).indexOf(id);
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  deleteProjectTasks(project) {
    const remove = [];
    for (const task of this.tasks) {
      if (task.project === project) remove.push(task);
    }
    this.tasks = this.tasks.filter((task) => !remove.includes(task));
    this.saveTasks();
  }
}

const taskManager = new TaskManager();
export { taskManager };
