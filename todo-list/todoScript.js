// 전역 변수 설정
let todos = [];
let nextId = 1;
let currentFilter = 'all'; 
let currentSortCriterion = 'regDate'; // 현재 정렬 기준 ('regDate' 또는 'dueDate')
let editingId = null; // 현재 수정 중인 항목의 ID (null이면 추가 모드)

// 현재 날짜/시간 포맷팅 함수
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 입력 폼 초기화 유틸리티 함수
function resetInputForm() {
    document.getElementById('todoInput').value = '';
    document.getElementById('category').value = '공부';
    document.getElementById('priority').value = '중간';
    document.getElementById('dueDate').type = 'text';
    document.getElementById('dueDate').value = '';

    editingId = null;
    document.getElementById('addBtn').disabled = false;
    document.getElementById('editCompleteBtn').disabled = true;
}

// 할 일 추가 함수
function addTodo() {
    const textInput = document.getElementById('todoInput').value;
    const categoryInput = document.getElementById('category').value;
    const priorityInput = document.getElementById('priority').value;
    const dueDateInput = document.getElementById('dueDate').value;

    if (!textInput.trim()) {
        alert('할 일을 입력해주세요!');
        return;
    }

    const displayDueDate = dueDateInput ? dueDateInput : '없음';

    const newTodo = {
        id: nextId++,
        text: textInput,
        category: categoryInput,
        priority: priorityInput,
        dueDate: displayDueDate,
        regDate: getCurrentDateTime(),
        completed: false
    };

    todos.push(newTodo);
    resetInputForm();
    renderTodos();
}

// [추가됨] 할 일 수정 모드 진입 함수
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // 기존 데이터를 상단 입력 폼에 채우기
    document.getElementById('todoInput').value = todo.text;
    document.getElementById('category').value = todo.category;
    document.getElementById('priority').value = todo.priority;
    
    const dueDateInput = document.getElementById('dueDate');
    if (todo.dueDate !== '없음') {
        dueDateInput.type = 'date';
        dueDateInput.value = todo.dueDate;
    } else {
        dueDateInput.type = 'text';
        dueDateInput.value = '';
    }

    // 수정 모드 상태 업데이트
    editingId = id;
    document.getElementById('addBtn').disabled = true;           // 추가 버튼 비활성화
    document.getElementById('editCompleteBtn').disabled = false; // 수정 완료 버튼 활성화
    
    // 사용자가 바로 타이핑할 수 있게 입력창에 포커스
    document.getElementById('todoInput').focus();
}

// 수정한 내용 저장 함수
function saveEditTodo() {
    if (editingId === null) return;

    const textInput = document.getElementById('todoInput').value;
    if (!textInput.trim()) {
        alert('할 일을 입력해주세요!');
        return;
    }

    // 수정 중인 객체를 찾아 값 덮어쓰기
    const todo = todos.find(t => t.id === editingId);
    if (todo) {
        todo.text = textInput;
        todo.category = document.getElementById('category').value;
        todo.priority = document.getElementById('priority').value;
        const dueDateInput = document.getElementById('dueDate').value;
        todo.dueDate = dueDateInput ? dueDateInput : '없음';
        // 등록일(regDate)은 최초 생성 시간을 유지하도록 변경하지 않습니다.
    }

    resetInputForm();
    renderTodos();
}

// 할 일 상태 변경 및 삭제 함수
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
}

// 필터 상태 변경
function changeFilter(filterType, element) {
    currentFilter = filterType;
    const buttons = element.parentNode.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderTodos();
}

// [추가됨] 정렬 기준(등록일/마감일) 버튼 클릭 시 UI 및 옵션 변경 함수
function changeSortCriterion(criterion) {
    currentSortCriterion = criterion;
    
    // 버튼 스타일 토글
    document.getElementById('btnSortReg').classList.remove('active');
    document.getElementById('btnSortDue').classList.remove('active');
    if (criterion === 'regDate') {
        document.getElementById('btnSortReg').classList.add('active');
    } else {
        document.getElementById('btnSortDue').classList.add('active');
    }

    // 선택된 기준에 따라 콤보박스 텍스트를 자연스럽게 변경
    const sortOrderSelect = document.getElementById('sortOrderSelect');
    sortOrderSelect.innerHTML = '';
    if (criterion === 'regDate') {
        sortOrderSelect.innerHTML = `
            <option value="desc">최신순</option>
            <option value="asc">과거순</option>
        `;
    } else {
        sortOrderSelect.innerHTML = `
            <option value="asc">임박순</option>
            <option value="desc">먼순</option>
        `;
    }
    
    renderTodos();
}

// 실시간 렌더링
const renderTodos = function() {
    const totalCount = todos.length;
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    document.getElementById('todoStats').innerText = `전체: ${totalCount}개 | 진행중: ${activeCount}개 | 완료: ${completedCount}개`;

    const todoList = document.getElementById('todolist');
    todoList.innerHTML = '';

    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredTodos = todos.filter(function(todo) {
        if (currentFilter === 'active' && todo.completed) return false;
        if (currentFilter === 'completed' && !todo.completed) return false;
        return todo.text.toLowerCase().includes(searchQuery);
    });

    // [수정됨] 분리된 기준(버튼)과 순서(콤보박스)를 결합한 정렬 로직
    const sortOrder = document.getElementById('sortOrderSelect').value; // 'desc' 또는 'asc'
    
    filteredTodos.sort(function(a, b) {
        if (currentSortCriterion === 'regDate') {
            if (sortOrder === 'desc') return b.id - a.id; // 최신순
            else return a.id - b.id; // 과거순
        } 
        else if (currentSortCriterion === 'dueDate') {
            if (a.dueDate === '없음') return 1;
            if (b.dueDate === '없음') return -1;
            
            if (sortOrder === 'asc') return a.dueDate.localeCompare(b.dueDate); // 임박순 (오름차순)
            else return b.dueDate.localeCompare(a.dueDate); // 먼순 (내림차순)
        }
        return 0;
    });

    filteredTodos.forEach(function(todo) {
        const liTag = document.createElement('li');
        liTag.classList.add('todo-item');
        
        if (todo.priority === '높음') liTag.classList.add('priority-high');
        else if (todo.priority === '중간') liTag.classList.add('priority-medium');
        else liTag.classList.add('priority-low');

        if (todo.completed) liTag.classList.add('complete');

        const text = `
            <h4 class="fw-bold mb-3">${todo.text}</h4>
            <div class="todo-info">
                <p>카테고리: ${todo.category}</p>
                <p>중요도: ${todo.priority}</p>
                <p>마감일: ${todo.dueDate}</p>
            </div>
            
            <div class="todo-footer">
                <span class="reg-date">등록일: ${todo.regDate}</span>
                
                <div class="btn-group">
                    <button onclick='toggleTodo(${todo.id})' class='btn btn-outline-secondary btn-sm'>
                        ${!todo.completed ? '완료' : '취소'}
                    </button>
                    <button onclick='editTodo(${todo.id})' class='btn btn-outline-secondary btn-sm'>수정</button>
                    <button onclick='deleteTodo(${todo.id})' class='btn btn-outline-secondary btn-sm'>삭제</button>
                </div>
            </div>
        `;
        
        liTag.innerHTML = text;
        todoList.appendChild(liTag);
    });
}

// HTML 로드 시 이벤트 바인딩
window.onload = function() {
    document.getElementById('addBtn').addEventListener('click', addTodo);
    document.getElementById('editCompleteBtn').addEventListener('click', saveEditTodo); // 수정 완료 이벤트 연결
    document.getElementById('sortOrderSelect').addEventListener('change', renderTodos);
    document.getElementById('searchInput').addEventListener('input', renderTodos);
}