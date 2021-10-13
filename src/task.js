export default class Task {
  constructor(project, id, title, description, date, checked) {
    this.id = id;
    this.project = project;
    this.title = title;
    this.description = description;
    this.date = date;
  }
}
