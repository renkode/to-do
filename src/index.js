import './style.css';
import Sortable from 'sortablejs';
import { format, isToday, isThisWeek, parseISO } from 'date-fns'

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

class TaskManager {
    constructor() {
        this.tasks = [];
        this.editingTask = "";
    }

    loadTasks(){
        var tasks = JSON.parse(window.localStorage.getItem("tasks"));
        if (!tasks) return;
        for (var task of tasks) {
          this.tasks.push(task);
          DOMManager.addTask(task);
        }
    }

    saveTasks(){
        window.localStorage.setItem("tasks",JSON.stringify(this.tasks));
    }

    createTask(project, title, description, date) {
        let task = new Task(project, ID(), title, description, date);
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

    updateId(){
        for (var i = 0; i < this.tasks.length; i++){
            this.tasks[i].id = i;
        }
    }

    deleteTask(id){
        let index = this.tasks.map(e => e.id).indexOf(id);
        this.tasks.splice(index,1);
        //this.updateId();
        this.saveTasks();
    }
}

class Task {
    constructor(project, id, title, description, date, checked) {
        this.id = id;
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
        if (!projects) return;
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

    deleteProject(index){
        this.projects.splice(index,1);
        this.saveProjects();
    }

    deleteCurrentProject() {
        let index = this.projects.indexOf(this.currentProject);
        this.deleteProject(index);
    }
}

let projectManager = new ProjectManager();
let taskManager = new TaskManager();

let DOMManager = (function(){
    let newProjectBtn = document.getElementById("new-project-btn");
    let delProjBtn = document.getElementById("del-project-btn");
    let projectList = document.getElementById("project-list");
    let newTaskBtn = document.getElementById("new-task-btn");
    let allTasks = document.getElementById("all-tasks");
    let tasksToday = document.getElementById("tasks-today");
    let tasksThisWeek = document.getElementById("tasks-this-week");
    let unsorted = document.getElementById("unsorted");
    let projectDropDwn = document.getElementById("project-input");
    let dateInput = document.getElementById("date-input");
    dateInput.setAttribute("min",format(new Date(), "yyyy-MM-dd"));
    dateInput.setAttribute("value",format(new Date(), "yyyy-MM-dd"));
    let log = document.getElementById("console");
    log.addEventListener("click", ()=>{console.table(taskManager.tasks)});
    

    function filterTasks(type){
        let taskNodes = Array.from(taskList.childNodes);
        taskNodes.shift(); // remove empty node
        switch (true) {
            case (projectManager.projects.includes(type)):
                for (var i = 0; i < taskManager.tasks.length; i++) {
                    if (taskManager.tasks[i].project !== type) {
                        taskNodes[i].style.display = "none";
                    } else {
                        taskNodes[i].style.display = "";
                    }  
                }
                break;
            case (type === "unsorted"):
                for (var i = 0; i < taskManager.tasks.length; i++) {
                    if (!projectManager.projects.includes(taskManager.tasks[i].project)) {
                        taskNodes[i].style.display = "";
                    } else {
                        taskNodes[i].style.display = "none";
                    }  
                }
                break;
            case (type === "today"):
                for (var i = 0; i < taskManager.tasks.length; i++) {
                    if (isToday(parseISO(taskManager.tasks[i].date))) {
                        taskNodes[i].style.display = "";
                    } else {
                        taskNodes[i].style.display = "none";
                    }  
                }
                break;
            case (type === "this week"):
                for (var i = 0; i < taskManager.tasks.length; i++) {
                    if (isThisWeek(parseISO(taskManager.tasks[i].date))) {
                        taskNodes[i].style.display = "";
                    } else {
                        taskNodes[i].style.display = "none";
                    }  
                }
                break;
            default:
                for (var node of taskNodes) {
                    node.style.display = "";
                }
                break;
        }
    }

    function swapTo(node) {
        projectList.childNodes.forEach(proj => {
            if (proj.nodeName !== "LI") return;
            proj.classList.remove("current-project");
        });
        node.classList.add("current-project");
        projectManager.currentProject = node.textContent;
        filterTasks(node.textContent);
        if (projectManager.projects.includes(projectManager.currentProject)) {
            delProjBtn.disabled = false;
        } else {
            delProjBtn.disabled = true;
        }
    }

    let setAsCurrentProject = function(e){
        swapTo(e.target);
    }

    function addProject(project) {
        let proj = document.createElement("li");
        proj.className = "project";
        proj.textContent = project;
        proj.addEventListener("click", setAsCurrentProject)
        projectList.appendChild(proj);
        addProjectToDropDwn(proj.textContent);
        return proj;
    }

    function addProjectToDropDwn(name) {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        projectDropDwn.appendChild(option);
    }

    function populateProjectDropDwn() {
        projectDropDwn.innerHTML = "";
        addProjectToDropDwn("Unsorted");
        for (var proj of projectManager.projects) {
            addProjectToDropDwn(proj);
        }
    }

    function removeCurrentProject() {
        for (var node of projectList.childNodes){
            if (node.nodeName !== "LI") continue;
            if (node.classList.contains("current-project")) projectList.removeChild(node);     
        };
    }

    function addTask(task) {
        let div = document.createElement("div");
        div.id = task.id;
        div.className = "task";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = false;
        checkbox.className = "checkbox";
        let title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;
        let date = document.createElement("span");
        date.className = "task-date";
        date.textContent = format(parseISO(task.date), "MMM do");
        let actions = document.createElement("span");
        actions.className = "actions";
        actions.innerHTML = "<button id='edit-btn'><i class='fas fa-edit'></i></button><button id='del-btn'><i class='fas fa-trash-alt'></i></button>";
        actions.lastChild.addEventListener("click", function(e){
            let taskNode = e.target.parentNode.parentNode;
            taskManager.deleteTask(taskNode.id);
            removeTask(taskNode);
        })
        div.append(checkbox,title,date,actions);
        taskList.appendChild(div);
    }

    function updateTaskId() {
        let tasks = Array.from(taskList.childNodes);
        tasks.shift(); // remove empty node
        for (var i = 0; i < tasks.length; i++){
            tasks[i].id = `${i}`;
        }
    }
    function removeTask(node) {
        taskList.removeChild(node);
        //updateTaskId();
    }

    newProjectBtn.addEventListener("click", () => {
        let project = prompt("Project name");
        projectManager.createProject(project);
        let node = addProject(project);
        swapTo(node);
    })

    delProjBtn.addEventListener("click", () => {
        let curProj = projectManager.currentProject;
        if (projectManager.projects.includes(curProj)) {
            removeCurrentProject();
            projectManager.deleteCurrentProject();
        }
        swapTo(projectList.childNodes[1]);
        populateProjectDropDwn();
    });
    
    newTaskBtn.addEventListener("click", () => {
        let today = new Date();
        let task = taskManager.createTask(projectManager.currentProject,`lorem ipsum ${taskManager.tasks.length}`,"This is a description",new Date().toISOString(),false);
        addTask(task);
    })

    allTasks.addEventListener("click", setAsCurrentProject);
    tasksToday.addEventListener("click", setAsCurrentProject);
    tasksThisWeek.addEventListener("click", setAsCurrentProject);
    unsorted.addEventListener("click", setAsCurrentProject);

    return { addProject, addTask, populateProjectDropDwn };
})();

let taskList = document.getElementById("task-list");
projectManager.loadProjects();
taskManager.loadTasks();
DOMManager.populateProjectDropDwn();
Sortable.create(taskList, {
    animation: 150,
    ghostClass: 'blue-background-class',
    group: "localStorage-example",
	store: {
		get: function (sortable) {
			var order = localStorage.getItem(sortable.options.group.name);
			return order ? order.split('|') : [];
		},
		set: function (sortable) {
			var order = sortable.toArray();
			localStorage.setItem(sortable.options.group.name, order.join('|'));
		}
	}
});
