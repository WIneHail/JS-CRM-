

function createMainHeader() {
    const headerWrapper = document.createElement('header');
    headerWrapper.classList.add('header');
    const logo = document.createElement('img');
    logo.src = 'img/logo.svg';
    logo.classList.add('logo');
    const searchForm = document.createElement('form');
    searchForm.setAttribute('autocomplete', 'off');
    const searchBar = document.createElement('input');
    searchBar.classList.add('header__searchbar');
    searchBar.placeholder = "Введите запрос";
    const searchBarWrapper = document.createElement('div');
    searchBarWrapper.classList.add('searchbar__autocomplete');
    searchBarWrapper.append(searchBar);
    searchForm.append(searchBarWrapper);
    headerWrapper.append(logo, searchForm);

    return {
        headerWrapper,
        searchBarWrapper,
    }
}

function createTabHead() {
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

function createTabBodyButtons(clId, createModalDel) {
    const tabBodyBtns = document.createElement('td');
    const tabBtnEdit = document.createElement('button');
    tabBtnEdit.textContent = "Изменить";
    tabBtnEdit.classList.add('body__btn-edit');
    tabBtnEdit.addEventListener("click", async () => {
        createModalForm(false, clId, tabBtnEdit);
    })
    const tabBtnDel = document.createElement('button');
    tabBtnDel.textContent = "Удалить";
    tabBtnDel.classList.add('body__btn-del');
    tabBtnDel.addEventListener("click", () => {
        createModalDel(clId);
    })
    tabBodyBtns.append(tabBtnEdit, tabBtnDel);
    return tabBodyBtns;
}

async function onDel(clId) {
    console.log(clId);
    const res = fetch(`http://localhost:3000/api/clients/${clId}`, {
        method: 'DELETE',
    })
}

function createModalDel(clId) {
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

function modalDismiss(modalBack, modalWindow, modalShadow) {
    function transitionWait() {
        modalBack.classList.remove('modal-active');
        modalShadow.classList.remove('modal__shadow-active');
        modalWindow.classList.remove('window-del');
        modalWindow.innerHTML = "";
        modalWindow.removeEventListener('transitionend', transitionWait);
    }
    modalWindow.addEventListener('transitionend', transitionWait);
    modalWindow.classList.remove('active');
    history.pushState("", document.title, window.location.pathname);

    return true;
}

async function createModalForm(createNew = false, clId, btn) {
    let client;
    let reqStatus;
    if (clId) {
        let req = await dataBtnLoading(btn, clId);
        client = req.data;
        reqStatus = req.res.status;
    } else {
        client = undefined;
    }
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
    if (createNew == true) {
        modalTitle.textContent = "Новый клиент";
    } else {
        modalTitle.textContent = "Изменить данные";
        modalId.textContent = `ID: ${client['id']}`;
        location.hash = clId;
    }

    if (reqStatus == 404) {
        createNew = true;
        modalTitle.textContent = "Не удалось найти клиента с данным ID. Вы можете создать нового.";
        client = undefined;
        modalId.textContent = '';
    }

    const modalCloseBtn = document.createElement('button');
    modalCloseBtn.classList.add('btn-close');
    modalCloseBtn.addEventListener('click', () => {
        modalDismiss(modalBack, modalWindow, modalShadow);
    })
    modalHeader.append(modalTitle, modalId, modalCloseBtn);

    const modalForm = document.createElement('form');
    modalForm.classList.add('modal__form');
    const modalFormFieldSet = document.createElement('fieldset');
    modalFormFieldSet.append(modalForm);
    modalWindow.append(modalHeader, modalFormFieldSet);

    const modalFooter = document.createElement('div');
    modalFooter.classList.add('modal__footer');
    const modalNameList = createModalNameList(client);
    const modalContacts = createModalContactsList(client);
    const modalFooterBtns = createModalFooterBtns(clId, modalBack, modalWindow, modalShadow);
    modalForm.append(modalNameList, modalContacts.contactsWrapper, modalFooter);
    modalFooter.append(modalFooterBtns.btnSave);
    if (createNew) {
        modalFooter.append(modalFooterBtns.btnCancel);
    } else {
        modalFooter.append(modalFooterBtns.btnDelConfirm);
    }
    window.btnSave = modalFooterBtns.btnSave;
    modalFooterBtns.btnSave.addEventListener('click', async (e) => {
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
        const valid = modalFormValidate(correctedClient, modalForm);


        if (valid) {
            modalFormFieldSet.disabled = true;
            const saveResult = await onSave(client, correctedClient);
            console.log(saveResult.status);
            if (saveResult.status != 201 && saveResult.status != 200) {
                errorsHandler(saveResult.status, saveResult.data);
                modalFormFieldSet.disabled = false;
            } else {
                history.pushState("", document.title, window.location.pathname);
                window.location.reload();
            }
        };
    })

    const modalWrapper = document.querySelector('.modal__wrap');

    modalWrapper.addEventListener('click', (e) => {
        if (e.target === modalWrapper) {
            modalDismiss(modalBack, modalWindow, modalShadow);
        }
    })
}

function modalFormValidate(correctedClient, modalForm) {
    console.log(correctedClient);
    const modalRequiredInputs = modalForm.querySelectorAll('[required]');
    let valid = true;
    modalRequiredInputs.forEach(elem => {
        const modalError = document.createElement('span');
        modalError.classList.add('modal__error');
        if (elem.classList.contains('names__input') && !elem.value) {
            modalError.textContent = 'Ошибка: Необходимо заполнить поле ввода';
            const elemParent = elem.closest('.names__wrapper');
            if (!elemParent.querySelector('.modal__error')) {
                elemParent.append(modalError);
            }
            valid = false;
        } else if (elem.classList.contains('modal__list') && !elem.innerHTML) {
            modalError.textContent = 'Ошибка: Добавьте хотя бы один контакт';
            modalError.classList.add('contacts');
            const elemParent = elem.closest('.modal__contacts');
            if (!elemParent.querySelector('.modal__error')) {
                elemParent.append(modalError);
            }
            valid = false;
        } else if ((elem.classList.contains('form__input') && !elem.value)) {
            modalError.textContent = 'Ошибка: Необходимо заполнить поле ввода контактной информации';
            modalError.classList.add('contact');
            const elemParent = elem.closest('.form__group');
            if (!elemParent.querySelector('.modal__error')) {
                elemParent.append(modalError);
            }
            valid = false;
        }
    })

    return valid;
}

function errorDissmis(block) {
    const errorBadge = block.querySelector('.modal__error');
    if (!errorBadge) {
        return;
    }
    errorBadge.remove();
}

function createModalNameList(client) {
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
    if (client != undefined) {
        lastName.name.value = client['lastName'];
        firstName.name.value = client['firstName'];
        middleName.name.value = client['middleName'];
        lastName.nameLabel.classList.add('names__label-shown');
        firstName.nameLabel.classList.add('names__label-shown');
        middleName.nameLabel.classList.add('names__label-shown');
    }

    return nameList;
}

function createModalNameElem(type, required, att) {
    const nameRequired = document.createElement('span');
    nameRequired.classList.add('names__badge');
    nameRequired.textContent = '*';

    const nameWrapper = document.createElement('div');
    nameWrapper.classList.add('names__wrapper');
    const name = document.createElement('input');
    const nameLabel = document.createElement('label');
    nameLabel.classList.add('names__label');
    name.name = `${att}Name`;
    name.id = `${att}Name`;
    nameLabel.textContent = type;
    if (required) {
        nameLabel.append(nameRequired);
        name.setAttribute('required', true)
    }

    name.classList.add('names__input');
    nameWrapper.append(name, nameLabel)

    name.addEventListener('input', () => {
        showLabel(nameLabel, name);
        if (name.value) {
            errorDissmis(nameWrapper);
        }
    })

    return {
        nameWrapper,
        name,
        nameLabel,
    }
}

function showLabel(label, input) {
    label.classList.add('names__label-shown');
    if (input.value.length == 0) {
        label.classList.remove('names__label-shown');
    }
}

function createModalContactsList(client) {
    const contactsWrapper = document.createElement('div');
    contactsWrapper.classList.add('modal__contacts');
    const contactsList = document.createElement('div');
    contactsList.classList.add('modal__list', 'form');
    contactsList.setAttribute('required', true);
    const contactsBtnWrapper = document.createElement('div');
    contactsBtnWrapper.classList.add('btn__wrapper');
    const contactsBtnNewContact = document.createElement('button');
    contactsBtnWrapper.append(contactsBtnNewContact);
    contactsBtnNewContact.classList.add('modal__btn');
    contactsBtnNewContact.textContent = 'Добавить контакт';
    contactsBtnNewContact.addEventListener('click', () => {
        if (!contactsList.innerHTML) {
            errorDissmis(contactsWrapper);
        }
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

    return {
        contactsWrapper,
        contactsList,
    };
}

function createModalContactForm(contact, list, btn) {
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
        if (contactsGroupInput.value) {
            errorDissmis(contactsGroup);
        }
        inputToggleCancelBtn(contactsGroupInput, contactsGroupBtn);
    })
    contactsGroupInput.setAttribute('required', 'true');
    contactsGroupInput.classList.add('form__input');
    contactsGroupInput.placeholder = "Введите данные контакта";
    const contactsGroupBtn = document.createElement('button');
    contactsGroupBtn.classList.add('form__del');
    contactsGroupBtn.addEventListener('click', () => {
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

function inputToggleCancelBtn(input, btn) {
    if (input.value.length > 0) {
        btn.classList.add('form__del-active')
    } else {
        btn.classList.remove('form__del-active')
    }
}

function createModalFooterBtns(clId, modalBack, modalWindow, modalShadow) {
    const btnSave = document.createElement('button');
    btnSave.classList.add('modal__btn-save');
    btnSave.textContent = 'Сохранить';
    const btnDel = document.createElement('button');
    btnDel.textContent = 'Удалить клиента';
    btnDel.classList.add('modal__btn-del');
    btnDel.addEventListener('click', () => {
        modalDismiss(modalBack, modalWindow, modalShadow);
        onDel(clId);
        window.location.reload();
    })
    const btnDelConfirm = document.createElement('button');
    btnDelConfirm.textContent = 'Удалить клиента';
    btnDelConfirm.classList.add('modal__btn-confirm');
    btnDelConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        modalDismiss(modalBack, modalWindow, modalShadow);
        modalPanelsTransfer(modalBack, clId);
    })
    const btnCancel = document.createElement('btn');
    btnCancel.textContent = 'Отмена';
    btnCancel.classList.add('modal__btn-cancel');
    btnCancel.addEventListener('click', () => {
        modalDismiss(modalBack, modalWindow, modalShadow);
    })

    return {
        btnSave,
        btnDel,
        btnDelConfirm,
        btnCancel,
    }
}

function modalPanelsTransfer(modalElem, clId) {
    function transitionWait() {
        createModalDel(clId);
        modalElem.removeEventListener('transitionend', transitionWait);
    }
    modalElem.addEventListener('transitionend', transitionWait);
}

async function onSave(client, newClient) {
    console.log(client);
    let methodType;
    let link;
    if (client) {
        methodType = "PATCH";
        link = `http://localhost:3000/api/clients/${client['id']}`;
    } else {
        methodType = "POST";
        link = `http://localhost:3000/api/clients/`;
    }
    const res = await fetch(link, {
        method: methodType,
        body: JSON.stringify({
            lastName: newClient["lastName"],
            firstName: newClient["firstName"],
            middleName: newClient["middleName"],
            createDate: newClient["createDate"],
            lastUpd: newClient["lastUpd"],
            contacts: newClient["contacts"]
        }),
        headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()

    const status = res.status;

    return {
        status,
        data,
    };
}

function errorsHandler(status, errs) {
    console.log('start')
    const parentBlock = document.querySelector('.modal__footer');
    const errorBadges = parentBlock.querySelectorAll('.errors');
    if (errorBadges) {
        errorBadges.forEach(
            elem => {
                elem.remove();
            }
        )
    }
    if (status == 404 || status == 422 || status.toString().startsWith('5')) {
        errs.errors.forEach(elem => {
            const errorBlock = document.createElement('span');
            errorBlock.classList.add('errors');
            errorBlock.textContent = `Ошибка: ${elem.message}`;
            parentBlock.prepend(errorBlock);
        })
    } else {
        const errorBlock = document.createElement('span');
        errorBlock.classList.add('errors');
        errorBlock.textContent = 'Что-то пошло не так...';
        parentBlock.prepend(errorBlock);
    }
}

function createMainFooter() {
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

function createTabRow(client) {
    const bodyTabRow = document.createElement('tr');
    bodyTabRow.classList.add('body__row');
    bodyTabRow.id = `id-${client['id']}`;
    fullName = `${client['lastName']} ${client['firstName']} ${client['middleName']}`
    const bodyTabDataStructural = ['id', 'fullName', 'createDate', 'lastUpd', 'contacts', 'functional'];
    bodyTabDataStructural.forEach(elem => {
        const bodyTabData = createTabData(elem, client, fullName);
        bodyTabRow.append(bodyTabData);
    })
    return bodyTabRow;
}

function createTabData(dataType, client, fullName) {
    let bodyItem = document.createElement('td');
    if (dataType == 'id') {
        bodyItem.textContent = client[dataType];
        bodyItem.classList.add('body__id')
    } else if (dataType == 'fullName') {
        bodyItem.textContent = fullName;
        bodyItem.classList.add('body__fullName')
    } else if (dataType == 'createDate' || dataType == 'lastUpd') {
        const dateWrapper = document.createElement('span');
        dateWrapper.classList.add('body__date');
        dateWrapper.textContent = new Date(client[dataType]).toLocaleDateString();
        const timeWrapper = document.createElement('span');
        timeWrapper.textContent = new Date(client[dataType]).toLocaleTimeString().slice(0, -3);
        timeWrapper.classList.add('body__time');
        bodyItem.append(dateWrapper, timeWrapper);
    } else if (dataType == 'contacts') {
        bodyItem.append(createContacts(client[dataType]));
    } else if (dataType == 'functional') {
        bodyItem = createTabBodyButtons(client['id'], createModalDel);
    }
    return bodyItem;
}

function createContacts(contacts) {
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
        } else {
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

function showContacts(contactsList, contactsItemExtra) {
    const contacts = contactsList.querySelectorAll('.item-hidded');
    contacts.forEach((elem) => {
        elem.classList.remove('item-hidded');
    })
    contactsItemExtra.remove();
}

function createContactLink(type, elem, pref) {
    const contactsLink = document.createElement('a');
    contactsLink.classList.add('contact__link');
    tippy(contactsLink, {
        theme: 'custom',
        content: `${type}: ${elem}`,
    });
    contactsLink.href = pref + elem;
    return contactsLink;
}

function searchArr(clientsArr, value) {
    // if (value === undefined || value == '') {
    //     const allBtns = document.querySelectorAll('.head__btn');
    //     allBtns.forEach(elem => {
    //         const btnKey = elem.dataset.key;
    //         elem.onclick = function () {
    //             fillTabWithSorting(btnKey, clientsArr);
    //         }
    //     })
    //     return clientsArr;
    // }
    value = value.toLowerCase().replace(/ /g, '');
    console.log(value);
    let foundClientArr = clientsArr.filter(function (elem) {
        return elem.firstName.toLowerCase().includes(value) ||
            elem.middleName.toLowerCase().includes(value) ||
            elem.lastName.toLowerCase().includes(value) ||
            elem.firstName.concat(elem.lastName, elem.middleName).toLowerCase().includes(value) ||
            elem.lastName.concat(elem.firstName, elem.middleName).toLowerCase().includes(value) ||
            new Date(elem.createDate).toLocaleDateString().includes(new Date(value).toLocaleDateString()) ||
            elem.createDate.includes(value) ||
            new Date(elem.lastUpd).toLocaleDateString().includes(new Date(value).toLocaleDateString()) ||
            elem.lastUpd.includes(value) ||
            elem.contacts.some(contact => {
                return Object.values(contact)[0].includes(value);
            })
    })

    // const allBtns = document.querySelectorAll('.head__btn');
    // allBtns.forEach(elem => {
    //     const btnKey = elem.dataset.key;
    //     elem.onclick = function () {
    //         fillTabWithSorting(btnKey, foundClientArr);
    //     }
    // })
    return foundClientArr;
}

function fillTabWithSorting(key, arr, firstFilling = false) {
    const body = document.querySelector('.table__body');
    if (body.hasChildNodes()) {
        body.innerHTML = " ";
    }
    const allBtns = document.querySelectorAll('.head__btn');
    const btn = document.querySelector(`[data-key=${key}]`);
    allBtns.forEach(elem => {
        if (elem != btn) {
            elem.classList.remove(('head__btn-active'));
        }
    })
    let sortedArr = arr.sort(function (a, b) {
        if (key == 'fullName') {
            valueA = a['lastName'] + a['firstName'] + a['middleName'];
            valueB = b['lastName'] + b['firstName'] + b['middleName'];
            return valueA.localeCompare(valueB);
        } else if (key == 'createDate' || key == 'lastUpd') {
            return new Date(a[key]) - new Date(b[key]);
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

async function dataLoading(body, clId) {
    const loader = document.createElement('div');
    loader.classList.add('loader');

    body.append(loader);

    let res;
    if (clId) {
        res = await fetch(`http://localhost:3000/api/clients/${clId}`);
    } else {
        res = await fetch('http://localhost:3000/api/clients');
    }
    const data = await res.json();

    loader.remove();

    if (!clId) {
        fillTabWithSorting("id", data, true);
    }

    return data;
}

async function dataBtnLoading(btn, clId) {

    if (btn) {
        btn.classList.add('btn-loader');
    }

    let res = await fetch(`http://localhost:3000/api/clients/${clId}`);

    const data = await res.json();

    if (btn) {
        btn.classList.remove('btn-loader');
    }

    return { data, res };
}

function searchAutoComplete(searchBar, searchBarWrapper, clientsArr) {
    console.log(clientsArr);
    if (searchBarWrapper.querySelector('.searchbar__list')) {
        searchBarWrapper.querySelector('.searchbar__list').remove();
    };
    const searchBarList = document.createElement('div');
    searchBarList.classList.add('searchbar__list');
    searchBarWrapper.append(searchBarList);
    searchBarList.innerHTML = '';
    clientsArr.forEach(elem => {
        const searchBarItem = document.createElement('div');
        searchBarItem.classList.add('searchbar__item');
        searchBarItem.textContent = `${elem['firstName']} ${elem['lastName']}`;

        searchBarItem.addEventListener('click', () => {
            const tabElem = document.querySelector(`#id-${elem["id"]}`);
            console.log(tabElem);
            tabElem.classList.add('highlited');
            tabElem.scrollIntoView({ behavior: "smooth" });
            searchBarWrapper.querySelector('.searchbar__list').remove();
            searchBar.value = "";
            function transitionWait() {
                tabElem.classList.remove('highlited');
                tabElem.removeEventListener('transitionend', transitionWait);
            }
            tabElem.addEventListener('transitionend', transitionWait);
        })
        searchBarItem.addEventListener('mouseover', (e) => {
            const searchBarItemList = searchBarWrapper.querySelectorAll('.searchbar__item');
            searchBarItemList.forEach(elem => {
                elem.classList.remove('active');
            });
            e.target.classList.add('active');
        })
        searchBarList.prepend(searchBarItem);
    })
}

async function createPageApp() {

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

    const tabWrapper = document.createElement('div');
    tabWrapper.classList.add('main__wrapper');
    const tab = document.createElement('table');
    tab.classList.add('table');
    const tabHeader = createTabHead();
    tab.append(tabHeader.tabHeadWrapper);
    const tabBody = document.createElement('tbody');
    tabBody.classList.add('table__body', 'body');
    tab.append(tabBody);
    tabWrapper.append(tab);


    mainContainer.append(tabWrapper);
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

    let i = -1;

    const searchBarWrapper = header.searchBarWrapper;
    const searchBar = searchBarWrapper.querySelector('.header__searchbar');
    let timerId;
    searchBar.addEventListener('input', async () => {
        let searchBarData = searchBar.value;
        i = -1;
        if (!searchBarData) {
            searchAutoComplete(searchBar, searchBarWrapper, []);
        }
        clearTimeout(timerId);
        timerId = setTimeout(async () => {
            const actualClientListArr = await dataLoading(tabBody);
            const newClientArr = searchArr(actualClientListArr, searchBarData);
            searchAutoComplete(searchBar, searchBarWrapper, newClientArr);
        }, 300);
        if (!searchBarData) {
            clearTimeout(timerId);
        }
    })

    searchBar.addEventListener('keydown', (e) => {
        const searchBarItemList = searchBarWrapper.querySelectorAll('.searchbar__item');
        if (e.keyCode == 40) {
            if (i < searchBarItemList.length - 1) {
                searchBarItemList.forEach(elem => {
                    elem.classList.remove('active');
                });
                i++;
                searchBarItemList[i].classList.add('active');
            } else if (i == searchBarItemList.length - 1) {
                searchBarItemList.forEach(elem => {
                    elem.classList.remove('active');
                });
                i = 0;
                searchBarItemList[i].classList.add('active');
            }
        } else if (e.keyCode == 38) {
            if (i > 0) {
                searchBarItemList.forEach(elem => {
                    elem.classList.remove('active');
                });
                i--;
                searchBarItemList[i].classList.add('active');
            } else if (i = -1) {
                searchBarItemList.forEach(elem => {
                    elem.classList.remove('active');
                });
                i = searchBarItemList.length - 1;
                searchBarItemList[i].classList.add('active');
            }
        } else if (e.keyCode == 13) {
            e.preventDefault();
            searchBarItemList[i].click();
        }
    })

    if (location.hash) {
        const clId = location.hash.replace('#', '');
        createModalForm(false, clId);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    createPageApp();
})
