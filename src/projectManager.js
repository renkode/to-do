export default class ProjectManager {
  constructor() {
    this.projects = [];
    this.currentProject = '';
  }

  loadProjects() {
    const projects = JSON.parse(window.localStorage.getItem('projects'));
    if (!projects) return;
    for (const proj of projects) {
      this.projects.push(proj);
    }
  }

  saveProjects() {
    window.localStorage.setItem('projects', JSON.stringify(this.projects));
  }

  createProject(project) {
    this.projects.push(project);
    this.saveProjects();
  }

  deleteProject(index) {
    this.projects.splice(index, 1);
    this.saveProjects();
  }

  deleteCurrentProject() {
    const index = this.projects.indexOf(this.currentProject);
    this.deleteProject(index);
  }
}

const projectManager = new ProjectManager();
export { projectManager };
