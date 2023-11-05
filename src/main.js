import PageController from './PageController.js'
import PageObserver from './PageObserver.js'
import FormController from './FormController.js'

const defaultPageId = 'why-js'
const getCurrentPageId = () => new URL(window.location).searchParams.get('id') || defaultPageId

/**
 * await DOM content loaded
 * @return {Promise<undefined>}
 */
const waitDocumentReady = () => ['interactive', 'complete'].includes(document.readyState)
    ? Promise.resolve()
    : new Promise((resolve, _reject) => { document.addEventListener('DOMContentLoaded', () => resolve()) })

const mainElement = document.querySelector('main')
const mainPageController = new PageController('pages/', mainElement)
mainPageController.setPage(getCurrentPageId())

let submitExampleFormController

const bindSubmitExampleFormController = () => {
    submitExampleFormController = new FormController(
        'form-submit-example',
        FormController.textEntry('code-src'),
        FormController.textEntry('author-username'),
        FormController.textEntry('author-email'),
        FormController.textEntry('code-title'),
        FormController.radioEntry('code-type'),
        FormController.buttonEntry('submit', _ => { submitExampleFormController.trySend() }))
}

const unbindSubmitExampleFormController = () => {
    submitExampleFormController = undefined
}

const pageObserver = new PageObserver(
    'submit-examples',
    _elem => { bindSubmitExampleFormController() },
    _elem => { unbindSubmitExampleFormController() })
mainPageController.registerObserver(pageObserver)

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
