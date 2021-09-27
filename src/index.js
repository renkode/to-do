import './style.css';
import Sortable from 'sortablejs';

var taskList = document.getElementById('task-list');
Sortable.create(taskList, {
    animation: 150,
    ghostClass: 'blue-background-class'
});

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    loadTasks(){
        var tasks = JSON.parse(window.localStorage.getItem("tasks"));
        for (var task of tasks) {
          this.tasks.push(task);
          DOMManager.addTask(task);
        }
    }

    saveTasks(){
        window.localStorage.setItem("tasks",JSON.stringify(this.tasks));
    }

    createTask(project, title, description, date) {
        let task = new Task(project, title, description, date);
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

    deleteTask(task){
        let index = this.tasks.indexOf(task);
        this.tasks.splice(index,1);
        this.saveProjects();
    }
}

class Task {
    constructor(project, title, description, date, checked) {
        this.project = project;
        this.title = title;
        this.description = description;
        this.date = date;
        this.checked = checked;
    }
}

class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = "";
    }

    loadProjects(){
        var projects = JSON.parse(window.localStorage.getItem("projects"));
        for (var proj of projects) {
          this.projects.push(proj);
          DOMManager.addProject(proj);
        }
    }

    saveProjects(){
        window.localStorage.setItem("projects",JSON.stringify(this.projects));
    }

    createProject(project) {
        this.projects.push(project);
        this.saveProjects();
    }

    deleteCurrentProject() {
        let index = this.projects.indexOf(this.currentProject);
        this.projects.splice(index,1);
        this.saveProjects();
    }
}

let projectManager = new ProjectManager();
let taskManager = new TaskManager();

let DOMManager = (function(){
    let newProjectBtn = document.getElementById("new-project-btn");
    let projectList = document.getElementById("project-list");
    let newTaskBtn = document.getElementById("new-task-btn");
    let taskList = document.getElementById("task-list");

    function addProject(project) {
        let proj = document.createElement("li");
        proj.className = "project";
        proj.textContent = project;
        projectList.appendChild(proj);
    }

    function addTask(task) {
        let div = document.createElement("div");
        div.className = "task";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = false;
        checkbox.className = "checkbox";
        let title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;
        let actions = document.createElement("span");
        actions.className = "actions";
        actions.innerHTML = "<button id='edit-btn'><i class='fas fa-edit'></i></button><button id='del-btn'><i class='fas fa-trash-alt'></i></button>";
        actions.lastChild.addEventListener("click", function(e){
            let currentList = document.getElementById("task-list");
            console.log(currentList.childNodes);
        })
        div.append(checkbox,title,actions);
        taskList.appendChild(div);
    }

    newProjectBtn.addEventListener("click", () => {
        let project = prompt("Project name");
        projectManager.createProject(project);
        addProject(project);
    })
    
    newTaskBtn.addEventListener("click", () => {
        let task = taskManager.createTask(projectManager.projects[0],"draw hoshua sex","","",false);
        addTask(task);
    })

    return { addProject, addTask };
})();

projectManager.loadProjects();
taskManager.loadTasks();
console.log(taskManager.tasks);