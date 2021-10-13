import {
  format, isToday, isThisWeek, parseISO,
} from 'date-fns';
import { projectManager } from './projectManager.js';
import { taskManager } from './taskManager';

const DOMManager = (function () {
  const projName = document.getElementById('proj-name-input');
  const newProjBtn = document.getElementById('new-project-btn');
  const projModalBtn = document.getElementById('proj-modal-btn');
  const delProjBtn = document.getElementById('del-project-btn');
  const projectNav = document.getElementById('project-nav');
  const projectErr = document.getElementById('project-error');

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
    const taskNodes = Array.from(taskList.querySelectorAll('.task'));
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
    const currentProj = document.querySelector('.current-project');
    if (currentProj) currentProj.classList.remove('current-project');
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
    proj.className = 'project nav-item ml-3';
    proj.textContent = project;
    proj.addEventListener('click', setAsCurrentProject);
    projectNav.appendChild(proj);
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
    const tasks = Array.from(taskList.querySelectorAll('.task'));
    for (const task of tasks) {
      if (!task.style.display) clearTask(task);
    }
  }

  function clearCurrentProject() {
    clearCurrentProjectTasks();
    const currentProj = document.querySelector('.current-project');
    if (currentProj) projectNav.removeChild(currentProj);
  }

  function clearTask(node) {
    taskList.removeChild(node);
  }

  const editTask = function (e) {
    taskFormTitle.textContent = 'Edit Task';
    taskManager.editingTask = true;
    const taskNode = e.target.closest('.task');
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
    div.className = 'row task mt-2 slidein';
    div.style.display = '';
    div.addEventListener('animationend', function(e){
      if(e.animationName === 'slidein') div.classList.remove('slidein');
      if(e.animationName === 'slideout') {
        taskManager.deleteTask(this);
        clearTask(this);
      } 
    });

    const colOne = document.createElement('div');
    colOne.className = 'col-1';
    const colTwo = document.createElement('div');
    colTwo.className = 'col-7';
    const colThree = document.createElement('div');
    colThree.className = 'date-and-actions col-4';
    const colFour = document.createElement('div');
    colFour.className = 'description col-11 offset-1';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = false;
    checkbox.className = 'checkbox';
    checkbox.addEventListener('click', function(e){
      const taskNode = e.target.closest('.task');
      const title = taskNode.querySelector('.task-title');
      e.target.checked
        ? (title.style.textDecoration = 'line-through')
        : (title.style.textDecoration = 'none');
    });

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const date = document.createElement('span');
    date.className = 'task-date';
    date.textContent = format(parseISO(task.date), 'MMM do');

    const desc = document.createElement('div');
    desc.className = 'collapse';
    desc.id = `desc${task.id}`
    const card = document.createElement('div');
    card.className = 'card card-body task-desc'
    card.textContent = task.description;
    desc.appendChild(card);

    const actions = document.createElement('span');
    actions.className = 'actions';
    actions.innerHTML = "<button class='chevron collapsed' data-toggle='collapse' data-target=''><i class='fas fa-chevron-down'></i><button class='edit-btn' data-toggle='modal' data-target='#input-window'><i class='fas fa-edit'></i></button><button class='del-btn'><i class='fas fa-trash-alt'></i></button>";

    const chevron = actions.querySelector('.chevron');
    chevron.dataset.target = `#${desc.id}`;
    chevron.addEventListener('click', (e) => {
      if (chevron.classList.contains('collapsed')) {
        e.target.classList.add('rotate-up');
        e.target.classList.remove('rotate-down');
      } else {
        e.target.classList.add('rotate-down');
        e.target.classList.remove('rotate-up');
      }
    })


    // edit button
    actions.querySelector('.edit-btn').addEventListener('click', editTask);

    // delete button
    actions.querySelector('.del-btn').addEventListener('click', (e) => {
      const taskNode = e.target.closest('.task');
      //taskManager.deleteTask(taskNode.id);
      //clearTask(taskNode);
      taskNode.classList.add('slideout');
    });

    colOne.appendChild(checkbox);
    colTwo.appendChild(title);
    colThree.append(date, actions);
    colFour.appendChild(desc);
    div.append(colOne, colTwo, colThree, colFour);
    taskList.appendChild(div);
  }

  function addExistingTasks() {
    const tasks = JSON.parse(window.localStorage.getItem('tasks'));
    if (!tasks) return;
    for (const task of tasks) {
      addTask(task);
    }
  }

  function updateTaskDiv(id) {
    const task = taskManager.tasks.find((t) => t.id === taskManager.targetId);
    const div = document.getElementById(id);
    const title = div.querySelector('.task-title');
    title.textContent = task.title;
    const date = div.querySelector('.task-date');
    date.textContent = format(parseISO(task.date), 'MMM do');
    let desc = div.querySelector('.task-desc');
    desc.textContent = task.description;
  }

  function loadAll(){
    addExistingProjects();
    addExistingTasks();
    populateProjectDropDown();
  }

  //=====================================================
  // Event Listeners
  //=====================================================

  newProjBtn.addEventListener('click', () => {
    projectInput.value = '';
  })
  
  projName.addEventListener('keyup', () => {
    projectManager.projects.includes(projName.value.toLowerCase())
      ? projectErr.style.visibility = 'visible'
      : projectErr.style.visibility = 'hidden';
  });
  
  projModalBtn.addEventListener('click', () => {
    const project = projName.value;
    if (!project || projectManager.projects.includes(project.toLowerCase())) return;
    projectManager.createProject(project);
    const node = addProject(project);
    swapTo(node);
    $('#project-modal').modal('hide');
  });

  delProjBtn.addEventListener('click', () => {
    const curProj = projectManager.currentProject;
    if (projectManager.projects.includes(curProj)) {
      taskManager.deleteProjectTasks(curProj);
      clearCurrentProject();
      projectManager.deleteCurrentProject();
    }
    swapTo(allTasks);
    populateProjectDropDown();
  });

  newTaskBtn.addEventListener('click', () => {
    taskFormTitle.textContent = 'New Task';
    titleInput.value = '';
    projectManager.projects.includes(projectManager.currentProject)
      ? (projectInput.value = projectManager.currentProject)
      : (projectInput.value = 'Unsorted');
    dateInput.setAttribute('value',format(new Date(), 'yyyy-MM-dd'));
    descInput.value = '';
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
    if (!titleInput.value) return;
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
        projectInput.value,
        titleInput.value,
        descInput.value,
        dateInput.value,
        false,
      );
      addTask(task);
    }
    $('#input-window').modal('hide')
  });

  return {
    taskList,
    loadAll,
  };
}());
export default DOMManager;
