import PageController from './PageController.js'

const defaultPageId = 'why-js'
const getCurrentPageId = () => new URL(window.location).searchParams.get('id') || defaultPageId

const mainElement = document.querySelector('main')
const mainPageController = new PageController('pages/', mainElement)
mainPageController.setPage(getCurrentPageId())

const navToPage = (pageName) => () => mainPageController.setPage(pageName)
const createNavLinks = (elems) => {
    for (const elem of elems) {
        elem.addEventListener('click', navToPage(elem.dataset.navTo))
    }
}

createNavLinks([...document.querySelectorAll('.nav-to')])
