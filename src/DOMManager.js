import {
  format, isToday, isThisWeek, parseISO,
} from 'date-fns';
import { projectManager } from './projectManager.js';
import { taskManager } from './taskManager';

const DOMManager = (function () {
  const newProjectBtn = document.getElementById('new-project-btn');
  const delProjBtn = document.getElementById('del-project-btn');
  const projectList = document.getElementById('project-list');
  const newTaskBtn = document.getElementById('new-task-btn');
  const newPlaceholderBtn = document.getElementById('new-placeholder');
  const taskList = document.getElementById('task-list');
  const allTasks = document.getElementById('all-tasks');
  const tasksToday = document.getElementById('tasks-today');
  const tasksThisWeek = document.getElementById('tasks-this-week');
  const unsorted = document.getElementById('unsorted');

  const inputWindow = document.getElementById('input-window');
  const taskFormTitle = document.getElementById('task-form-title');
  const titleInput = document.getElementById('title-input');
  const projectInput = document.getElementById('project-input');
  const dateInput = document.getElementById('date-input');
  const descInput = document.getElementById('desc-input');
  const confirmBtn = document.getElementById('confirm-btn');
  dateInput.setAttribute('min', format(new Date(), 'yyyy-MM-dd'));
  dateInput.setAttribute('value', format(new Date(), 'yyyy-MM-dd'));

  const log = document.getElementById('console');
  log.addEventListener('click', () => {
    console.table(taskManager.tasks);
  });

  function filterTasks(type) {
    // display tasks depending on current tab
    const taskNodes = Array.from(taskList.childNodes);
    taskNodes.shift(); // remove empty node
    switch (true) {
      case projectManager.projects.includes(type):
        for (let i = 0; i < taskManager.tasks.length; i++) {
          if (taskManager.tasks[i].project !== type) {
            taskNodes[i].style.display = 'none';
          } else {
            taskNodes[i].style.display = '';
          }
        }
        break;
      case type === 'unsorted':
        for (let i = 0; i < taskManager.tasks.length; i++) {
          if (!projectManager.projects.includes(taskManager.tasks[i].project)) {
            taskNodes[i].style.display = '';
          } else {
            taskNodes[i].style.display = 'none';
          }
        }
        break;
      case type === 'today':
        for (let i = 0; i < taskManager.tasks.length; i++) {
          if (isToday(parseISO(taskManager.tasks[i].date))) {
            taskNodes[i].style.display = '';
          } else {
            taskNodes[i].style.display = 'none';
          }
        }
        break;
      case type === 'this week':
        for (let i = 0; i < taskManager.tasks.length; i++) {
          if (isThisWeek(parseISO(taskManager.tasks[i].date))) {
            taskNodes[i].style.display = '';
          } else {
            taskNodes[i].style.display = 'none';
          }
        }
        break;
      default:
        for (const node of taskNodes) {
          node.style.display = '';
        }
        break;
    }
  }

  function swapTo(node) {
    // swap to a project tab
    projectList.childNodes.forEach((proj) => {
      if (proj.nodeName !== 'LI') return;
      proj.classList.remove('current-project');
    });
    node.classList.add('current-project');
    projectManager.currentProject = node.textContent;
    filterTasks(node.textContent);
    if (projectManager.projects.includes(projectManager.currentProject)) {
      delProjBtn.disabled = false;
    } else {
      delProjBtn.disabled = true;
    }
  }

  const setAsCurrentProject = function (e) {
    swapTo(e.target);
  };

  function addProjectToDropDown(name) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    projectInput.appendChild(option);
  }

  function addProject(project) {
    const proj = document.createElement('li');
    proj.className = 'project';
    proj.textContent = project;
    proj.addEventListener('click', setAsCurrentProject);
    projectList.appendChild(proj);
    addProjectToDropDown(proj.textContent);
    return proj;
  }

  function addExistingProjects() {
    const projects = JSON.parse(window.localStorage.getItem('projects'));
    if (!projects) return;
    for (const proj of projects) {
      addProject(proj);
    }
  }

  function populateProjectDropDown() {
    projectInput.innerHTML = '';
    addProjectToDropDown('Unsorted');
    for (const proj of projectManager.projects) {
      addProjectToDropDown(proj);
    }
  }

  function clearCurrentProjectTasks() {
    for (const task of Array.from(taskList.childNodes)) {
      if (task.nodeName === 'DIV' && !task.style.display) {
        clearTask(task);
      }
    }
  }

  function clearCurrentProject() {
    clearCurrentProjectTasks();
    for (const node of projectList.childNodes) {
      if (node.nodeName !== 'LI') continue;
      if (node.classList.contains('current-project')) { projectList.removeChild(node); }
    }
  }

  function toggleInputWindow(bool) {
    bool
      ? (inputWindow.style.display = '')
      : (inputWindow.style.display = 'none');
  }

  function clearTask(node) {
    taskList.removeChild(node);
  }

  const editTask = function (e) {
    inputWindow.style.display
      ? toggleInputWindow(true)
      : toggleInputWindow(false);
    taskFormTitle.textContent = 'Edit Task';
    taskManager.editingTask = true;
    const taskNode = e.target.parentNode.parentNode;
    const task = taskManager.tasks.find((t) => t.id === taskNode.id);
    taskManager.targetId = task.id;
    titleInput.value = task.title;
    projectManager.projects.includes(task.project)
      ? (projectInput.value = task.project)
      : (projectInput.value = 'Unsorted');
    dateInput.value = format(parseISO(task.date), 'yyyy-MM-dd');
    descInput.value = task.description;
  };

  function addTask(task) {
    const div = document.createElement('div');
    div.id = task.id;
    div.className = 'task';
    div.style.display = '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = false;
    checkbox.className = 'checkbox';

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const date = document.createElement('span');
    date.className = 'task-date';
    date.textContent = format(parseISO(task.date), 'MMM do');

    const actions = document.createElement('span');
    actions.className = 'actions';
    actions.innerHTML = "<button id='edit-btn'><i class='fas fa-edit'></i></button><button id='del-btn'><i class='fas fa-trash-alt'></i></button>";

    // edit button
    actions.firstChild.addEventListener('click', editTask);

    // delete button
    actions.lastChild.addEventListener('click', (e) => {
      const taskNode = e.target.parentNode.parentNode;
      taskManager.deleteTask(taskNode.id);
      clearTask(taskNode);
    });

    div.append(checkbox, title, date, actions);
    taskList.appendChild(div);
  }

  function addExistingTasks() {
    const tasks = JSON.parse(window.localStorage.getItem('tasks'));
    if (!tasks) return;
    for (const task of tasks) {
      DOMManager.addTask(task);
    }
  }

  function updateTaskDiv(id) {
    const task = taskManager.tasks.find((t) => t.id === taskManager.targetId);
    const div = document.getElementById(id);
    const title = div.querySelector('.task-title');
    title.textContent = task.title;
    const date = div.querySelector('.task-date');
    date.textContent = format(parseISO(task.date), 'MMM do');
    // let desc = div.querySelector(".task-desc");
    // desc.textContent = task.desc;
  }

  newProjectBtn.addEventListener('click', () => {
    const project = prompt('Project name');
    if (!project) return;
    projectManager.createProject(project);
    const node = addProject(project);
    swapTo(node);
  });

  delProjBtn.addEventListener('click', () => {
    const curProj = projectManager.currentProject;
    if (projectManager.projects.includes(curProj)) {
      taskManager.deleteProjectTasks(curProj);
      clearCurrentProject();
      projectManager.deleteCurrentProject();
    }
    swapTo(projectList.childNodes[1]);
    populateProjectDropDown();
  });

  newTaskBtn.addEventListener('click', () => {
    taskFormTitle.textContent = 'New Task';
    titleInput.value = '';
    projectManager.projects.includes(projectManager.currentProject)
      ? (projectInput.value = projectManager.currentProject)
      : (projectInput.value = 'Unsorted');
    // dateInput.setAttribute("value",format(new Date(), "yyyy-MM-dd"));
    descInput.value = '';
    inputWindow.style.display
      ? toggleInputWindow(true)
      : toggleInputWindow(false);
  });
  newPlaceholderBtn.addEventListener('click', () => {
    const today = new Date();
    const task = taskManager.createTask(
      projectManager.currentProject,
      `lorem ipsum ${taskManager.tasks.length}`,
      'This is a description',
      new Date().toISOString(),
      false,
    );
    addTask(task);
  });

  allTasks.addEventListener('click', setAsCurrentProject);
  tasksToday.addEventListener('click', setAsCurrentProject);
  tasksThisWeek.addEventListener('click', setAsCurrentProject);
  unsorted.addEventListener('click', setAsCurrentProject);

  confirmBtn.addEventListener('click', () => {
    if (taskManager.editingTask) {
      const task = taskManager.tasks.find((t) => t.id === taskManager.targetId);
      taskManager.updateTask(
        task,
        projectInput.value,
        titleInput.value,
        descInput.value,
        dateInput.value,
      );
      updateTaskDiv(taskManager.targetId);
      filterTasks(projectManager.currentProject);
      taskManager.editingTask = false;
    } else {
      const task = taskManager.createTask(
        projectManager.currentProject,
        titleInput.value,
        descInput.value,
        dateInput.value,
        false,
      );
      addTask(task);
    }
    inputWindow.style.display = 'none';
  });

  return {
    taskList,
    addProject,
    addTask,
    addExistingProjects,
    addExistingTasks,
    populateProjectDropDown,
  };
}());
export default DOMManager;
