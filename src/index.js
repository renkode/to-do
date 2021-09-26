import './style.css';
import Sortable from 'sortablejs';

var taskList = document.getElementById('task-list');
Sortable.create(taskList, {
    animation: 150,
    ghostClass: 'blue-background-class'
});