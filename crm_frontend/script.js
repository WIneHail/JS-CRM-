// (() => {

    function createMainHeader (){
        const headerWrapper = document.createElement('header');
        headerWrapper.classList.add('header');
        const logo = document.createElement('img');
        logo.src = 'img/logo.svg';
        logo.classList.add('logo');
        const searchBar = document.createElement('input');
        searchBar.classList.add('header__searchbar');
        searchBar.placeholder = "Введите запрос";
        headerWrapper.append(logo);
        headerWrapper.append(searchBar);
        
        return {
            headerWrapper,
            searchBar,
        }
    }

    function createTabHead (){
        const tabHeadKeys = ['id', 'fullName', 'createDate', 'lastUpd'];
        const tabHeadData = ['ID', 'Фамилия Имя Отчество', 'Дата и время создания', 'Последние изменения', 'Контакты', 'Действия'];
        const tabHeadWrapper = document.createElement('thead');
        tabHeadWrapper.classList.add('table__head', 'head')
        
        const tabHeadRow = document.createElement('tr');
        tabHeadRow.classList.add('head__row')
        let tabHeadBtnArr = [];
        tabHeadData.forEach((elem, i) => {
                let tabHeadBtn = document.createElement('button');
                let tabHeadItem = document.createElement('th');
                tabHeadItem.classList.add('head__item');
                if (i < 4) {
                    tabHeadBtn.classList.add('head__btn');
                    tabHeadItem.append(tabHeadBtn);
                    tabHeadBtn.textContent = elem;
                    tabHeadBtn.setAttribute('data-key', tabHeadKeys[i]);
                    tabHeadBtnArr.push(tabHeadBtn);                  
                } else {
                    tabHeadItem.textContent = elem;
                }
                if (i == 1) {
                    tabHeadBtn.classList.add('head__btn-name');
                }
                tabHeadRow.append(tabHeadItem);
            }
        )
        tabHeadWrapper.append(tabHeadRow);
        return {
            tabHeadWrapper,
            tabHeadBtnArr,
        }
    }

    function createTabBodyButtons (client, createModalDel){
        const tabBodyBtns = document.createElement('td');
        const tabBtnEdit = document.createElement('button');
        tabBtnEdit.textContent = "Изменить";
        tabBtnEdit.classList.add('body__btn-edit');
        tabBtnEdit.addEventListener("click", () => {
            createModalForm (false, client['id']);
        })
        const tabBtnDel = document.createElement('button');
        tabBtnDel.textContent = "Удалить";
        tabBtnDel.classList.add('body__btn-del');
        tabBtnDel.addEventListener("click", () => {
            createModalDel(client['id']);
        })
        tabBodyBtns.append(tabBtnEdit, tabBtnDel);
        return tabBodyBtns;
    }

    function onDel (clId) {
        clientsListArr.splice(clId, 1);
    }

    function createModalDel (clId) {
        const modalBack = document.querySelector('.modal__back');
        const modalShadow = document.querySelector('.modal__shadow');
        modalShadow.classList.add('modal__shadow-active');
        modalBack.classList.add('modal-active');
        const modalWindow = document.querySelector('.modal__window');
        modalWindow.classList.add('active', 'window-del');
        const modalTitle = document.createElement('h3');
        modalTitle.classList.add('modal__title', 'title-del');
        modalTitle.textContent = 'Удалить клиента';
        const modalMessage = document.createElement('p');
        modalMessage.classList.add('modal__message');
        modalMessage.textContent = 'Вы действительно хотите удалить данного клиента?';
        const modalCloseBtn = document.createElement('button');
        modalCloseBtn.classList.add('btn-close');
            modalCloseBtn.addEventListener('click', () => {
            modalDismiss(modalBack, modalWindow, modalShadow);
        })
        const btns = createModalFooterBtns(clId, modalBack, modalWindow, modalShadow);
        btns.btnDel.textContent = "Удалить";
        btns.btnDel.classList.add('btn-del')
        const modalFooter = document.createElement('div');
        modalFooter.classList.add('modal__footer');
        modalFooter.append(btns.btnDel, btns.btnCancel);
        modalWindow.append(modalTitle, modalMessage, modalCloseBtn, modalFooter);
    }

    function modalDismiss (modalBack, modalWindow, modalShadow) {
        modalWindow.classList.remove('active');
        setTimeout(() => {
        modalBack.classList.remove('modal-active');
        modalShadow.classList.remove('modal__shadow-active');
        modalWindow.classList.remove('window-del');
        modalWindow.innerHTML = "";
        }
        , 200)
    }

    async function createModalForm (createNew = false, clId) {
        const modalBack = document.querySelector('.modal__back');
        const modalShadow = document.querySelector('.modal__shadow');
        modalShadow.classList.add('modal__shadow-active');
        modalBack.classList.add('modal-active');
        const modalWindow = document.querySelector('.modal__window');
        modalWindow.classList.add('active');
        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal__header');
        const modalTitle = document.createElement('h3');
        modalTitle.classList.add('modal__title');
        const modalId = document.createElement('p');
        modalId.classList.add('modal__id');
        let client = undefined
        if (createNew == true) {
            modalTitle.textContent = "Новый клиент";
        } else {
            modalTitle.textContent = "Изменить данные";
            modalId.textContent = `ID: ${clId}`;
            client = await dataLoading(modalWindow, clId);
        }
        const modalCloseBtn = document.createElement('button');
        modalCloseBtn.classList.add('btn-close');
            modalCloseBtn.addEventListener('click', () => {
            modalDismiss(modalBack, modalWindow, modalShadow);
        })
        modalHeader.append(modalTitle, modalId, modalCloseBtn);

        const modalForm = document.createElement('form');
        modalWindow.append(modalHeader, modalForm);

        const modalFooter = document.createElement('div');
        modalFooter.classList.add('modal__footer');
        const modalNameList = createModalNameList(client);
        const modalContactsList = createModalContactsList(client);
        const modalFooterBtns = createModalFooterBtns(client, modalBack, modalWindow, modalShadow);
        modalForm.append(modalNameList, modalContactsList, modalFooter);
        modalFooter.append(modalFooterBtns.btnSave);
        if (createNew) {
            modalFooter.append(modalFooterBtns.btnCancel);
        } else {
            modalFooter.append(modalFooterBtns.btnDel);
        }
        window.btnSave = modalFooterBtns.btnSave;
        modalFooterBtns.btnSave.addEventListener('click', (e) => {
            e.preventDefault();
            const clientForm = new FormData(modalForm);
            const clientKeys = ['lastName', 'firstName', 'middleName', 'lastUpd', 'contacts'];  
            let correctedClient = [];
            clientKeys.forEach((elem) => {
                if (elem == 'lastUpd') {
                    correctedClient[elem] = new Date().toISOString();
                } else if (elem == 'contacts') {
                    correctedClient['contacts'] = [];
                    const contactSelectArr = document.querySelectorAll('.choices__item.is-selected');
                    const contactInputArr = document.querySelectorAll('.form__input');
                    contactSelectArr.forEach((elem, i) => {
                        let contactObj = {};                        
                        contactObj.type = elem.innerHTML;
                        contactObj.value = contactInputArr[i].value;
                        correctedClient['contacts'].push(contactObj);
                    }) 
                } else {
                    correctedClient[elem] = clientForm.get(elem);
                }                
            })
            if (!client) {
                correctedClient['createDate'] = new Date().toISOString();
            } else {
                correctedClient['createDate'] = client['createDate'];
            }
            console.log(correctedClient);
            onSave(clId, correctedClient);
        })
        modalBack.addEventListener('click', () => {
            // modalDismiss(modalBack, modalWindow, modalShadow); - не получается добавить обаботчик собычтия клик только на задник модального окна.
        })
    }

    function createModalNameList (client) {
        const nameList = document.createElement('div');
        nameList.classList.add('modal__names', 'names');
        const lastNameRequired = document.createElement('span');
        lastNameRequired.classList.add('names__badge');
        lastNameRequired.textContent = '*';
        const firstNameRequired = document.createElement('span');
        firstNameRequired.classList.add('names__badge');
        firstNameRequired.textContent = '*';

        const lastName = createModalNameElem("Фамиля", true, 'last');
        const firstName = createModalNameElem("Имя", true, 'first');
        const middleName = createModalNameElem("Отчество", false, 'middle');

        nameList.append(lastName.nameWrapper, firstName.nameWrapper, middleName.nameWrapper);
        if (client != undefined){
            lastName.name.value = client['lastName'];
            firstName.name.value = client['firstName'];
            middleName.name.value = client['middleName'];
            lastName.nameLabel.classList.add('names__label-shown');
            firstName.nameLabel.classList.add('names__label-shown');
            middleName.nameLabel.classList.add('names__label-shown');
        }
        
        return nameList;
    }

    function createModalNameElem (type, required, att) {
        const nameRequired = document.createElement('span');
        nameRequired.classList.add('names__badge');
        nameRequired.textContent = '*';

        const nameWrapper = document.createElement('div');
        nameWrapper.classList.add('names__wrapper');
        const name = document.createElement('input');
        const nameLabel = document.createElement('label');
        nameLabel.classList.add('names__label');
        name.name = `${att}Name`;
        nameLabel.textContent = type;
        if (required) {
            nameLabel.append(nameRequired);
            name.setAttribute('required', true)
        }
        
        name.classList.add('names__input');
        // name.name = `${type}name`;
        nameWrapper.append(name, nameLabel)

        name.addEventListener('input', () => {
            showLabel(nameLabel, name);
        })

        return {
            nameWrapper,
            name,
            nameLabel,
        }
    }

    function showLabel (label, input) {
        label.classList.add('names__label-shown');
        if (input.value.length == 0) {
            label.classList.remove('names__label-shown');
        }
    }

    function createModalContactsList (client) {
        const contactsWrapper = document.createElement('div');
        contactsWrapper.classList.add('modal__contacts');
        const contactsList = document.createElement('div');
        contactsList.classList.add('modal__list', 'form');
        const contactsBtnWrapper = document.createElement('div');
        contactsBtnWrapper.classList.add('btn__wrapper');
        const contactsBtnNewContact = document.createElement('button');
        contactsBtnWrapper.append(contactsBtnNewContact);
        contactsBtnNewContact.classList.add('modal__btn');
        contactsBtnNewContact.textContent = 'Добавить контакт';
        contactsBtnNewContact.addEventListener('click', (e) => {
            e.preventDefault();
            const contactGroup = createModalContactForm(undefined, contactsList, contactsBtnNewContact);
            contactsList.append(contactGroup);
        })
        if (client != undefined) {
            const contactsArr = client['contacts'];
            contactsArr.forEach((elem) => {
                const contactGroup = createModalContactForm(elem, contactsList, contactsBtnNewContact);
                contactsList.append(contactGroup);
            })
            contactsList.classList.add('modal__list-active');
        }
        contactsWrapper.append(contactsList, contactsBtnWrapper);


        return contactsWrapper;
    }

    function createModalContactForm (contact, list, btn) {
        if (list != undefined) {
            list.classList.add('modal__list-active');
        }
        let contactsSummary = document.querySelectorAll('.form__group');
        if (contactsSummary.length == 10) {
            btn.classList.add('modal__btn-hide');
        }
        const contactsGroup = document.createElement('div');
        contactsGroup.classList.add('form__group');
        let contactsGroupSelect = document.createElement('select');
        contactsGroupSelect.classList.add('form__contact');
        contactsGroupSelect.setAttribute('required', 'true');
        contactsGroupSelect.name = 'contacts';
        const contactsOptions = ['Телефон', 'Email', 'Facebook', 'VK', 'Другое'];
        contactsOptions.forEach((elem, i) => {
            const contactsGroupOption = document.createElement('option');
            contactsGroupOption.textContent = elem;
            contactsGroupOption.value = i;
            contactsGroupSelect.append(contactsGroupOption);
        })
        let contactsGroupInput = document.createElement('input');
        contactsGroupInput.addEventListener('input', () => {
            inputToggleCancelBtn (contactsGroupInput, contactsGroupBtn);
        })
        contactsGroupInput.setAttribute('required', 'true');
        contactsGroupInput.classList.add('form__input');
        contactsGroupInput.placeholder = "Введите данные контакта";
        const contactsGroupBtn = document.createElement('button');
        contactsGroupBtn.classList.add('form__del');
        contactsGroupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactsGroup.remove();
            contactsSummary = document.querySelectorAll('.form__group');
            if (contactsSummary.length < 11) {
                btn.classList.remove('modal__btn-hide');
            }
            if (list != undefined && !list.hasChildNodes()) {
                list.classList.remove('modal__list-active');
            }
        })
        contactsGroup.append(contactsGroupSelect, contactsGroupInput, contactsGroupBtn);

        if (contact != undefined) {
            contactsGroupSelect.value = contactsOptions.indexOf(contact['type']);
            contactsGroupInput.value = contact['value'];
            contactsGroupBtn.classList.add('form__del-active')
        }

        const choices = new Choices(contactsGroupSelect, {
            searchEnabled: false,
            itemSelectText: '',
            shouldSort: false,
        });
        
        return contactsGroup;
    }

    function inputToggleCancelBtn (input, btn) {
        if (input.value.length > 0) {
            btn.classList.add('form__del-active')
        }else{
            btn.classList.remove('form__del-active')
        }
    }

    function createModalFooterBtns (client, modalBack, modalWindow, modalShadow) {
        const btnSave = document.createElement('button');
        btnSave.classList.add('modal__btn-save');
        btnSave.textContent = 'Сохранить';
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Удалить клиента';
        btnDel.classList.add('modal__btn-del');
            btnDel.addEventListener('click', (e) => {
                e.preventDefault();
                modalDismiss(modalBack, modalWindow, modalShadow);
                onDel(client['id']);
            })
        const btnCancel = document.createElement('btn');
        btnCancel.textContent = 'Отмена';
        btnCancel.classList.add('modal__btn-cancel');
        btnCancel.addEventListener('click', (e) => {
            e.preventDefault();
            modalDismiss(modalBack, modalWindow, modalShadow);
        })
        
        return {
            btnSave,
            btnDel,
            btnCancel,
        }
    }

    async function onSave (clId, client){
        let methodType;
        let link;
        if (clId) {
            methodType = "PATCH";
            link = `http://localhost:3000/api/clients/${clId}`;
        } else {
            methodType = "POST";
            link = `http://localhost:3000/api/clients/`;
        }
        const res = await fetch (link, {
            method: methodType,
            body: JSON.stringify({
                lastName: client["lastName"],
                firstName: client["firstName"],
                middleName: client["middleName"],
                createDate: client["createDate"],
                lastUpd: client["lastUpd"],
                contacts: client["contacs"]
            }),
            headers: {"Content-Type": "application/json"},
        })
    }

    function createMainFooter () {
        const footerWrapper = document.createElement('div');
        footerWrapper.classList.add('main__footer');
        const footerBtn = document.createElement('button');
        footerBtn.textContent = "Добавить клиента";
        footerBtn.classList.add('btn-footer');
        footerBtn.setAttribute("data-bs-toggle", "modal");
        footerBtn.setAttribute("data-bs-target", "#myModal");
        footerBtn.addEventListener('click', () => {
            createModalForm(true);
        })
        footerWrapper.append(footerBtn);
        return footerWrapper;
    }

    function createTabRow (client){
        const bodyTabRow = document.createElement('tr');
        bodyTabRow.classList.add('body__row')
        let fullName = "";
        for (key in client) {
            const bodyItem = document.createElement('td');
            fullName = `${client['lastName']} ${client['firstName']} ${client['middleName']}`
            if(key == 'lastName'){
                bodyItem.textContent = fullName;
                bodyTabRow.append(bodyItem);
            }else if (key == 'middleName' || key == 'firstName'){
            }else if (key == 'createDate' || key == 'lastUpd') {
                const dateWrapper = document.createElement('span'); 
                dateWrapper.classList.add('body__date');
                console.log(client[key]);
                dateWrapper.textContent = new Date (client[key]).toLocaleDateString();
                const timeWrapper = document.createElement('span'); 
                timeWrapper.textContent = new Date (client[key]).toLocaleTimeString().slice(0, -3);
                timeWrapper.classList.add('body__time');
                bodyItem.append(dateWrapper, timeWrapper);
                bodyTabRow.append(bodyItem);
            }else if (key == 'contacts'){
                bodyItem.append(createContacts(client[key]));
                bodyTabRow.append(bodyItem);
            }else{
                bodyItem.textContent = client[key];
                bodyTabRow.append(bodyItem);
                bodyItem.classList.add('body__id')
            }
        }
        const tabBodyBtns = createTabBodyButtons(client, createModalDel);
        bodyTabRow.append(tabBodyBtns);
        
        return bodyTabRow;
    }

    function createContacts (contacts){
        const contactsList = document.createElement('ul');
        contactsList.classList.add('body__contacts', 'contacts');
        contacts.forEach((elem, i) => {
            const contactsItem = document.createElement('li');
            let key;
            let pref;
            if (i > 3) {
                contactsItem.classList.add('item-hidded');  
            }
            if (elem['type'] == 'Телефон') {
                key = 0;
                pref = 'tel:';
            } else if (elem['type'] == 'Email') {
                key = 1;
                pref = 'mailto:';
            } else if (elem['type'] == 'Facebook') {
                key = 2;
                pref = 'https:';
            } else if (elem['type'] == 'VK') {
                key = 3;
                pref = 'https:';
            }  else {
                key = 4;
                pref = 'https:';
            }
            contactsItem.classList.add('contacts__item');
            const contactsLink = createContactLink(elem['type'], elem['value'], pref);
            contactsItem.classList.add(`contacts__item-${key}`);
            contactsList.append(contactsItem);
            contactsItem.append(contactsLink);
        })
        if (contacts.length > 4) {
            const contactsItemExtra = document.createElement('button');
            contactsItemExtra.classList.add('contacts__btn');
            contactsItemExtra.textContent = `+${contacts.length - 4}`;
            contactsList.append(contactsItemExtra);
            contactsItemExtra.addEventListener('click', () => {
                showContacts(contactsList, contactsItemExtra);
            })
        }

        return contactsList;
    }

    function showContacts (contactsList, contactsItemExtra) {
        const contacts = contactsList.querySelectorAll('.item-hidded');
        contacts.forEach((elem) => {
            elem.classList.remove('item-hidded');
        })
        contactsItemExtra.remove();
    }

    function createContactLink (type, elem, pref) {
        const contactsLink = document.createElement('a');
        contactsLink.classList.add('contact__link');
        tippy(contactsLink, {
            theme: 'custom',
            content: `${type}: ${elem}`,
        });
        contactsLink.href = pref + elem;
        return contactsLink;
    }

    function searchArr (clientsArr, value) {
        if (value === undefined || value == '') {
            const allBtns = document.querySelectorAll('.head__btn');
            allBtns.forEach(elem => {
                const btnKey = elem.dataset.key;
                elem.onclick = function () {
                    fillTabWithSorting(btnKey, clientsArr);
                }
            })
            return clientsArr;
        }
        value = value.toLowerCase();
        let foundClientArr = clientsArr.filter(function (elem) {
            return elem.firstName.toLowerCase().includes(value) ||
                elem.middleName.toLowerCase().includes(value) ||
                elem.lastName.toLowerCase().includes(value) ||
                new Date(elem.createDate).toLocaleDateString().includes(new Date(value).toLocaleDateString()) ||
                elem.createDate.includes(value) ||
                new Date(elem.lastUpd).toLocaleDateString().includes(new Date(value).toLocaleDateString()) ||
                elem.lastUpd.includes(value) ||
                elem.contacts.some(contact => {
                    return Object.values(contact)[0].includes(value); 
                })
        })
        
        const allBtns = document.querySelectorAll('.head__btn');
        allBtns.forEach(elem => {
            const btnKey = elem.dataset.key;
            elem.onclick = function () {
                fillTabWithSorting(btnKey, foundClientArr);
            }
        })
        return foundClientArr;
    }

    function fillTabWithSorting (key, arr, firstFilling = false) {
        const  body = document.querySelector('.table__body');
        if (body.hasChildNodes()) {
            body.innerHTML = " ";
        }
        const allBtns = document.querySelectorAll('.head__btn');
        const btn = document.querySelector(`[data-key=${key}]`);
        allBtns.forEach (elem => {
            if (elem != btn) {
                elem.classList.remove(('head__btn-active'));
            }   
        })
        let sortedArr = arr.sort(function (a, b) {
            if (key == 'fullName'){
                valueA = a['lastName'] + a['firstName'] + a['middleName'];
                valueB = b['lastName'] + b['firstName'] + b['middleName'];
                return valueA.localeCompare(valueB);
            } else if (key == 'createDate' || key == 'lastUpd') {
                return new Date (a[key]) - new Date (b[key]);
            } else {
                return a[key] - b[key];
            }
        });
        if (btn.classList.contains('head__btn-active') && firstFilling == false) {
            sortedArr = sortedArr.reverse();
            btn.classList.toggle('head__btn-active');
        } else {
            btn.classList.add('head__btn-active');
        }
        sortedArr.forEach(elem => {
            const bodyTabRow = createTabRow(elem);
            body.append(bodyTabRow);
        })
        
    }

    async function dataLoading (body, clId) {
        const loader = document.createElement('div');
        loader.classList.add('loader');
        body.append(loader);
        let res;
        if (clId) {
            res = await fetch (`http://localhost:3000/api/clients/${clId}`);
        } else {
            res = await fetch ('http://localhost:3000/api/clients');
        }
        const data = await res.json();

        loader.remove();
        if (!clId) {
            fillTabWithSorting ("id", data, true);
        }

        return data;
    }

    async function createPageApp (){

        const container = document.querySelector('.container');
        const modalBack = document.createElement('div');
        modalBack.classList.add('modal__back')
        const modalWrapper = document.createElement('div');
        modalWrapper.classList.add('modal__wrap')
        const modalWindow = document.createElement('div');
        modalWindow.classList.add('modal__window');
        modalWrapper.append(modalWindow);
        modalBack.append(modalWrapper);
        container.append(modalBack);
        const header = createMainHeader();
        container.append(header.headerWrapper);

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('main');
        const title = document.createElement('h2');
        title.textContent = 'Клиенты'
        title.classList.add('title');
        mainContainer.append(title);

        const tab = document.createElement('table');
        tab.classList.add('table');
        const tabHeader = createTabHead();
        tab.append(tabHeader.tabHeadWrapper);
        const tabBody = document.createElement('tbody');
        tabBody.classList.add('table__body', 'body');
        tab.append(tabBody);

        
        mainContainer.append(tab);
        container.append(mainContainer);
        const footer = createMainFooter();
        mainContainer.append(footer);

        const modalShadow = document.createElement('div');
        modalShadow.classList.add('modal__shadow');
        container.append(modalShadow);


        // Логическая часть

        const clientsListArr = await dataLoading(tabBody);

        const tabHeadBtnArr = tabHeader.tabHeadBtnArr;
        tabHeadBtnArr.forEach(elem => {
            elem.onclick = function () {
                fillTabWithSorting(elem.dataset.key, clientsListArr);
            }  
        })
        

        const searchBar = header.searchBar;
        let timerId;
        searchBar.addEventListener('input', () => {
            let searchBarData = searchBar.value;
            clearTimeout(timerId);
            if (searchBarData == '') {
                const newClientArr = searchArr(clientsListArr); 
                fillTabWithSorting ("id", newClientArr, true);
            } 
            timerId = setTimeout(() => {
                const newClientArr = searchArr(clientsListArr, searchBarData);
                fillTabWithSorting ("id", newClientArr, true);
            }, 300);
            if (!searchBarData) {
                clearTimeout(timerId);
            }
        })

    }

   document.addEventListener('DOMContentLoaded', () => {
       createPageApp();
   })
// })()
