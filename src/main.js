import PageController from './PageController.js'

const defaultPageId = 'why-js'
const getCurrentPageId = () => new URL(window.location).searchParams.get('id') || defaultPageId

/**
 * await DOM content loaded
 * @return {Promise<undefined>}
 */
const waitDocumentReady = () => ['interactive', 'complete'].includes(document.readyState) ? Promise.resolve() :
    new Promise((resolve, _reject) => { document.addEventListener('DOMContentLoaded', () => resolve()) })


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
waitDocumentReady().then(() => { 
    const preHideElementClassList = document.querySelector('#pre-hide').classList
    preHideElementClassList.add('pre-hidden')
    setTimeout(() => { preHideElementClassList.add('pre-hidden-clear') }, 1000)
})
