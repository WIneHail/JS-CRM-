/* eslint-disable no-console */
// импорт стандартных библиотек Node.js
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { createServer } = require('http');

// файл для базы данных дел
const DB_FILE = './db.json';
// префикс URI для всех методов приложения
const URI_PREFIX = '/api/clients';
// номер порта, на котором будет запущен сервер
const PORT = 3000;

/**
 * Класс ошибки, используется для отправки ответа с определённым кодом и описанием ошибки
 */
class TodoApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Асинхронно считывает тело запроса и разбирает его как JSON
 * @param {Object} req - Объект HTTP запроса
 * @throws {TodoApiError} Некорректные данные в аргументе
 * @returns {Object} Объект, созданный из тела запроса
 */
function drainJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });
}

/**
 * Проверяет входные данные и создаёт из них корректный объект дела
 * @param {Object} data - Объект с входными данными
 * @throws {TodoApiError} Некорректные данные в аргументе (statusCode 422)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} Объект дела
 */
function makeTodoItemFromData(data) {
  const errors = [];

  // составляем объект, где есть только необходимые поля
  const clientItem = {
    id: data.id && String(data.id),
    lastName: data.lastName && String(data.lastName),
    firstName: data.firstName && String(data.firstName),
    createDate: data.createDate && String(data.createDate),
    lastUpd: data.lastUpd && String(data.lastUpd),
    contacts: data.contacts && Object(data.contacts)
  };

  // проверяем, все ли данные корректные и заполняем объект ошибок, которые нужно отдать клиенту
  if (!clientItem.id) errors.push({ field: 'id', message: 'Не указан id' });
  if (!clientItem.lastName) errors.push({ field: 'lastName', message: 'Не указана Фамилия' });
  if (!clientItem.firstName) errors.push({ field: 'firstName', message: 'Не указано Имя' });
  if (!clientItem.createDate) errors.push({ field: 'createDate', message: 'Не указана дата создания' });
  if (!clientItem.lastUpd) errors.push({ field: 'lastUpd', message: 'Не указана дата обновения' });
  if (!clientItem.contacts) errors.push({ field: 'contacts', message: 'Не указаны контакты' });

  // если есть ошибки, то кидаем ошибку с их списком и 422 статусом
  if (errors.length) throw new TodoApiError(422, { errors });

  return clientItem;
}

/**
 * Возвращает список дел из базы данных
 * @param {{ search: string }} [params] - поиск по параметру search
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }[]} Массив дел
 */
function getClientsList(params = {}) {
  const ClientsList = JSON.parse(readFileSync(DB_FILE) || '[]');
  if (params.search) return ClientsList.filter(({ search }) => search === params.search);
  return ClientsList;
}

/**
 * Создаёт и сохраняет дело в базу данных
 * @throws {TodoApiError} Некорректные данные в аргументе, дело не создано (statusCode 422)
 * @param {Object} data - Данные из тела запроса
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }} Объект дела
 */
function createTodoItem(data) {
  const newItem = makeTodoItemFromData(data);
  newItem.id = Date.now().toString();
  writeFileSync(DB_FILE, JSON.stringify([...getClientsList(), newItem]), { encoding: 'utf8' });
  return newItem;
}

/**
 * Возвращает объект дела по его ID
 * @param {string} itemId - ID дела
 * @throws {TodoApiError} Дело с таким ID не найдено (statusCode 404)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }} Объект дела
 */
function getTodoItem(itemId) {
  const todoItem = getClientsList().find(({ id }) => id === itemId);
  if (!todoItem) throw new TodoApiError(404, { message: 'TODO Item Not Found' });
  return todoItem;
}

/**
 * Изменяет дело с указанным ID и сохраняет изменения в базу данных
 * @param {string} itemId - ID изменяемого дела
 * @param {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }} data - Объект с изменяемыми данными
 * @throws {TodoApiError} Дело с таким ID не найдено (statusCode 404)
 * @throws {TodoApiError} Некорректные данные в аргументе (statusCode 422)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }} Объект дела
 */
function updateTodoItem(itemId, data) {
  const todoItems = getClientsList();
  const itemIndex = todoItems.findIndex(({ id }) => id === itemId);
  if (itemIndex === -1) throw new TodoApiError(404, { message: 'TODO Item Not Found' });
  Object.assign(todoItems[itemIndex], makeTodoItemFromData({ ...todoItems[itemIndex], ...data }));
  writeFileSync(DB_FILE, JSON.stringify(todoItems), { encoding: 'utf8' });
  return todoItems[itemIndex];
}

/**
 * Удаляет дело из базы данных
 * @param {string} itemId - ID дела
 * @returns {{}}
 */
function deleteTodoItem(itemId) {
  const todoItems = getClientsList();
  const itemIndex = todoItems.findIndex(({ id }) => id === itemId);
  if (itemIndex === -1) throw new TodoApiError(404, { message: 'TODO Item Not Found' });
  todoItems.splice(itemIndex, 1);
  writeFileSync(DB_FILE, JSON.stringify(todoItems), { encoding: 'utf8' });
  return {};
}

// создаём новый файл с базой данных, если он не существует
if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, '[]', { encoding: 'utf8' });

// создаём HTTP сервер, переданная функция будет реагировать на все запросы к нему
createServer(async (req, res) => {
  // req - объект с информацией о запросе, res - объект для управления отправляемым ответом

  // этот заголовок ответа указывает, что тело ответа будет в JSON формате
  res.setHeader('Content-Type', 'application/json');

  // CORS заголовки ответа для поддержки кросс-доменных запросов из браузера
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
  // в этом случае достаточно ответить с пустым телом и этими заголовками
  if (req.method === 'OPTIONS') {
    // end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

  // если URI не начинается с нужного префикса - можем сразу отдать 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
    return;
  }

  // убираем из запроса префикс URI, разбиваем его на путь и параметры
  const [uri, query] = req.url.substr(URI_PREFIX.length).split('?');
  const queryParams = {};

  // параметры могут отсутствовать вообще или иметь вид a=b&b=c
  // во втором случае наполняем объект queryParams { a: 'b', b: 'c' }
  if (query) {
    for (const piece of query.split('&')) {
      const [key, value] = piece.split('=');
      queryParams[key] = value ? decodeURIComponent(value) : '';
    }
  }

  try {
    // обрабатываем запрос и формируем тело ответа
    const body = await (async () => {
      if (uri === '' || uri === '/') {
        // /api/clients
        if (req.method === 'GET') return getClientsList(queryParams);
        if (req.method === 'POST') {
          const newTodoItem = createTodoItem(await drainJson(req));
          res.statusCode = 201;
          res.setHeader('Location', `${URI_PREFIX}/${newTodoItem.id}`);
          return newTodoItem;
        }
      } else {
        // /api/clients/{id}
        // параметр {id} из URI запроса
        const itemId = uri.substr(1);
        if (req.method === 'GET') return getTodoItem(itemId);
        if (req.method === 'PATCH') return updateTodoItem(itemId, await drainJson(req));
        if (req.method === 'DELETE') return deleteTodoItem(itemId);
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    // обрабатываем сгенерированную нами же ошибку
    if (err instanceof TodoApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server Error' }));
      console.error(err);
    }
  }
})
// выводим инструкцию, как только сервер запустился...
  .on('listening', () => {
    console.log(`Сервер TODO запущен. Вы можете использовать его по адресу http://localhost:${PORT}`);
    console.log('Нажмите CTRL+C, чтобы остановить сервер');
    console.log('Доступные методы:');
    console.log(`GET ${URI_PREFIX} - получить список дел, query параметр search отправляет поисковый запрос`);
    console.log(`POST ${URI_PREFIX} - создать дело, в теле запроса нужно передать объект {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }}`);
    console.log(`GET ${URI_PREFIX}/{id} - получить дело по его ID`);
    console.log(`PATCH ${URI_PREFIX}/{id} - изменить дело с ID, в теле запроса нужно передать объект {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[] }}`);
    console.log(`DELETE ${URI_PREFIX}/{id} - удалить дело по ID`);
  })
// ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
