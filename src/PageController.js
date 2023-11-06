import Observable from './observer/Observable.js'

class PageController extends Observable {
    /**
     * Create a page controller for a container element.
     * @constructor
     * @param {string} pageMagazineUrl URL to the page magazine, containing html sections
     * @param {Element} containerElement dom element which will contain the page
     */
    constructor (pageMagazineUrl, containerElement) {
        super()
        this.pageMagazineUrl = pageMagazineUrl
        this.errorPageMagazineUrl = ''
        this.containerElement = containerElement
        this.currentPageName = null

        this.registerOnPopState()
    }

    /**
     * Navigate to a page.
     * @async
     * @param {string} pageName name of the page
     * @param {boolean} rewind don't push history state
     */
    async setPage (pageName, rewind = false) {
        if (this.currentPageName === pageName) return

        this.notifyObservers('pop')
        this.currentPageName = pageName

        const pageUrl = this.getPageUrl(pageName, 'json')
        const pageData = await this.getPageData(pageUrl)
        const pageContent = this.parsePageContent(await this.getPageContent(pageData))
        const pageTitle = pageData.title

        this.updateContainer(pageContent)
        this.updateTitle(pageTitle)
        if (!rewind) this.updateUrl(pageName)

        this.notifyObservers('push')
    }

    /**
     * Set document title.
     * @param {string} newTitle new page title
     */
    updateTitle (newTitle) {
        document.title = newTitle
    }

    /**
     * Set page content.
     * @param {Element} newContent new page content
     */
    updateContainer (newContent) {
        // remove all previous elements
        while (this.containerElement.hasChildNodes()) {
            this.containerElement.removeChild(this.containerElement.firstChild)
        }

        // set class
        newContent.classList.add('fade-in-page')

        // add content
        this.containerElement.appendChild(newContent)
    }

    /**
     * Push history entry of this page URL.
     * @param {string} pageName name of the page
     */
    updateUrl (pageName) {
        window.history.pushState({ pageName }, null, this.getPageLink())
    }

    /**
     * Register to set page on history navigation event.
     */
    registerOnPopState () {
        window.addEventListener(
            'popstate',
            ({ state }) => { this.setPage(state.pageName, true) })
    }

    /**
     * Get url to a resource.
     * @param {string} parentPathUrl parent path of the resource
     * @param {string} resourceName name of the resource
     * @param {string} [extension] extension of the file, without the dot, leave empty to not add
     * @return {string} url for the resource
     */
    static getResourceUrl (parentPathUrl, resourceName, extension) {
        const parentPath = parentPathUrl.concat(
            parentPathUrl.endsWith('/') ? '' : '/')
        const expanededExtension = extension === undefined ? '' : '.' + extension
        return parentPath + resourceName + expanededExtension
    }

    /**
     * Get URL to a page.
     * @param {string} pageName name of the page
     * @param {string} [extension] extension of the file, without the dot, leave empty to not add
     * @return {string} URL for the page
     */
    getPageUrl (pageName, extension) {
        return PageController.getResourceUrl(
            this.pageMagazineUrl,
            pageName,
            extension)
    }

    /**
     * Get URL link to specified page.
     * @return {string}
     */
    getPageLink (pageName) {
        const url = new URL(window.location.href)
        url.searchParams.set('id', this.currentPageName)
        return url.href
    }

    /**
     * Get URL to an error page.
     * @param {string} pageName name of the error page
     * @param {string} [extension] extension of the file, without the dot, leave empty to not add
     * @return {string} URL for the error page
     */
    getErrorPageUrl (pageName, extension) {
        return PageController.getResourceUrl(
            PageController.defaultErrorPageMagazineUrl,
            pageName,
            extension)
    }

    /**
     * Get embedded or external page content,
     * if external not found, serve not found page.
     * @async
     * @param {object} pageData JSON containing page data
     * @param {string} pageData.title title of the page
     * @param {string} [pageData.content] embedded content of the page
     * @param {string} [pageData.url] external URL to the content
     * @return {Promise<string>} input page content or not found page content
     */
    async getPageContent (pageData) {
        if (Object.entries(pageData).length === 0) return ''

        console.log(pageData)

        const isContentEmbedded = pageData.content !== undefined
        const isContentExternal = pageData.url !== undefined

        console.log(isContentEmbedded, isContentExternal)
        console.log(pageData.content, pageData.url)

        if (isContentEmbedded) {
            return Promise.resolve(pageData.content)
        } else if (isContentExternal) {
            const headers = { 'Content-Type': 'text/html' }
            try {
                const response = await fetch(this.getPageUrl(pageData.url), { headers })
                if (response.status < 400) return await response.text()
            } catch (error) {
                if (!(error instanceof TypeError)) console.error(error)
            }
        }

        const underConstructionPageUrl = this.getErrorPageUrl(PageController.underConstructionPageName, 'json')
        return await this.getPageContent(this.getPageData(underConstructionPageUrl, true))
    }

    /**
     * Parse returned page content into DOM tree.
     * @param {string} pageContentText page content as a string
     * @returns {Element} root of the page - a <template> element
     */
    parsePageContent (pageContentText) {
        const htmlDocument = PageController.domParser.parseFromString(pageContentText, 'text/html')
        const contentRoot = htmlDocument.querySelector('section')
        return contentRoot
    }

    /**
     * Get page data as JSON, if not found get not found page data.
     * @async
     * @param {string} pageUrl URL of the page
     * @param {boolean} [isFinalTry] do not try to fetch error page
     * @return {Promise<object>} JSON data of requested page or not found page
     */
    async getPageData (pageUrl, isFinalTry = false) {
        const headers = { 'Content-Type': 'application/json' }
        try {
            const response = await fetch(pageUrl, { headers })
            if (response.status < 400) return await response.json()
        } catch (error) {
            if (!(error instanceof TypeError)) console.error(error)
        }

        if (!isFinalTry) {
            const notFoundPageUrl = this.getErrorPageUrl(PageController.notFoundPageName, 'json')
            return await this.getPageData(notFoundPageUrl)
        }

        return {}
    }

    static domParser = new DOMParser()

    static defaultErrorPageMagazineUrl = 'error-pages/'
    static notFoundPageName = 'page-not-found'
    static underConstructionPageName = 'page-under-construction'
}

export default PageController
