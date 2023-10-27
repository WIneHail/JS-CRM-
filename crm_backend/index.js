/* eslint-disable no-console */
// импорт стандартных библиотек Node.js
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { createServer } = require('http');

// файл для базы данных клиентов
const DB_FILE = './db.json';
// префикс URI для всех методов приложения
const URI_PREFIX = '/api/clients';
// номер порта, на котором будет запущен сервер
const PORT = 3000;

let counter;

if (!existsSync(DB_FILE)) {
  counter = 0;
} else {
  counter = Object.keys(JSON.parse(readFileSync(DB_FILE) || "[]")).length;
}




/**
 * Класс ошибки, используется для отправки ответа с опреклиентовённым кодом и описанием ошибки
 */
class clientApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Асинхронно считывает тело запроса и разбирает его как JSON
 * @param {Object} req - Объект HTTP запроса
 * @throws {clientApiError} Некорректные данные в аргументе
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
 * Проверяет входные данные и создаёт из них корректный объект клиента
 * @param {Object} data - Объект с входными данными
 * @throws {clientApiError} Некорректные данные в аргументе (statusCode 422)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} Объект клиента
 */
function makeclientItemFromData(data) {
  const errors = [];

  // составляем объект, где есть только необходимые поля
  const clientItem = {
    lastName: data.lastName && String(data.lastName),
    firstName: data.firstName && String(data.firstName),
    middleName: data.middleName && String(data.middleName),
    createDate: data.createDate,
    lastUpd: data.lastUpd,
    contacts: data.contacts,
  };

  // проверяем, все ли данные корректные и заполняем объект ошибок, которые нужно отдать клиенту
  if (!clientItem.lastName) errors.push({ field: 'lastName', message: 'Не указана Фамилия' });
  if (!clientItem.firstName) errors.push({ field: 'firstName', message: 'Не указано Имя' });
  if (!clientItem.createDate) errors.push({ field: 'createDate', message: 'Не указана дата создания' });
  if (!clientItem.lastUpd) errors.push({ field: 'lastUpd', message: 'Не указана дата обновения' });
  if (!clientItem.contacts.length) errors.push({ field: 'contacts', message: 'Не указаны контакты' });

  console.log(errors);

  // если есть ошибки, то кидаем ошибку с их списком и 422 статусом
  if (errors.length) throw new clientApiError(422, { errors });

  return clientItem;
}

/**
 * Возвращает список клиентов из базы данных
 * @param {{ search: string }} [params] - поиск по параметру search
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }[]} Массив клиентов
 */
function getClientsList(params = {}) {
  const ClientsList = JSON.parse(readFileSync(DB_FILE) || "[]");
  if (params.search) return ClientsList["clients"].filter(({ search }) => search === params.search);
  return ClientsList;
}

/**
 * Создаёт и сохраняет клиент в базу данных
 * @throws {clientApiError} Некорректные данные в аргументе, клиент не создано (statusCode 422)
 * @param {Object} data - Данные из тела запроса
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} Объект клиента
 */
function createclientItem(data) {
  const newItem = makeclientItemFromData(data);
  const newId = ++counter;
  newItem.id = newId.toString();
  writeFileSync(DB_FILE, JSON.stringify([...getClientsList(), newItem]), { encoding: 'utf8' });
  return newItem;
}

/**
 * Возвращает объект клиента по его ID
 * @param {string} itemId - ID клиента
 * @throws {clientApiError} Клиент с таким ID не найдено (statusCode 404)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} Объект клиента
 */
function getclientItem(itemId) {
  const clientItem = getClientsList().find(({ id }) => id === itemId);
  if (!clientItem) throw new clientApiError(404, { message: 'Клиент не найден' });
  return clientItem;
}

/**
 * Изменяет клиент с указанным ID и сохраняет изменения в базу данных
 * @param {string} itemId - ID изменяемого клиента
 * @param {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} data - Объект с изменяемыми данными
 * @throws {clientApiError} Клиент с таким ID не найдено (statusCode 404)
 * @throws {clientApiError} Некорректные данные в аргументе (statusCode 422)
 * @returns {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }} Объект клиента
 */
function updateclientItem(itemId, data) {
  const clientItems = getClientsList();
  const itemIndex = clientItems.findIndex(({ id }) => id === itemId);
  if (itemIndex === -1) throw new clientApiError(404, { message: 'Клиент не найден' });
  Object.assign(clientItems[itemIndex], makeclientItemFromData({ ...clientItems[itemIndex], ...data }));
  writeFileSync(DB_FILE, JSON.stringify(clientItems), { encoding: 'utf8' });
  return clientItems[itemIndex];
}

/**
 * Удаляет клиент из базы данных
 * @param {string} itemId - ID клиента
 * @returns {{}}
 */
function deleteclientItem(itemId) {
  const clientItems = getClientsList();
  const itemIndex = clientItems.findIndex(({ id }) => id === itemId);
  if (itemIndex === -1) throw new clientApiError(404, { message: 'Клиент не найден' });
  clientItems.splice(itemIndex, 1);
  counter--;
  clientItems.forEach((elem, i) => {
    let id = ++i;
    elem['id'] = id.toString();
  })

  writeFileSync(DB_FILE, JSON.stringify(clientItems), { encoding: 'utf8' });
  return {};
}

// создаём новый файл с базой данных, если он не существует
if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, "[]", { encoding: 'utf8' });

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
    res.end(JSON.stringify({ message: 'Некоректный путь' }));
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
          const newclientItem = createclientItem(await drainJson(req));
          res.statusCode = 201;
          res.setHeader('Location', `${URI_PREFIX}/${newclientItem.id}`);
          return newclientItem;
        }
      } else {
        // /api/clients/{id}
        // параметр {id} из URI запроса
        const itemId = uri.substr(1);
        if (req.method === 'GET') return getclientItem(itemId);
        if (req.method === 'PATCH') return updateclientItem(itemId, await drainJson(req));
        if (req.method === 'DELETE') return deleteclientItem(itemId);
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    // обрабатываем сгенерированную нами же ошибку
    if (err instanceof clientApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Ошибка сервера' }));
      console.error(err);
    }
  }
})
  // выводим инструкцию, как только сервер запустился...
  .on('listening', () => {
    console.log(`Сервер client запущен. Вы можете использовать его по адресу http://localhost:${PORT}`);
    console.log('Нажмите CTRL+C, чтобы остановить сервер');
    console.log('Доступные методы:');
    console.log(`GET ${URI_PREFIX} - получить список клиентов, query параметр search отправляет поисковый запрос`);
    console.log(`POST ${URI_PREFIX} - создать клиента, в теле запроса нужно передать объект {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }}`);
    console.log(`GET ${URI_PREFIX}/{id} - получить клиента по его ID`);
    console.log(`PATCH ${URI_PREFIX}/{id} - изменить клиента с ID, в теле запроса нужно передать объект {{ lastName: string, firstName: string, middleName: string, createDate: string, lastUpd: string, contacts: object[ {type: string, value: string} ] }}`);
    console.log(`DELETE ${URI_PREFIX}/{id} - удалить клиента по ID`);
  })
  // ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
