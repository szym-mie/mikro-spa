import Observer from './observer/Observer.js'

class PageObserver extends Observer {
    /**
     * @callback onPageNav
     * @param {Element} containerElement container element of the page
     */

    /**
     * @constructor
     * @param {string} pageName page subject
     * @param {onPageNav} onPageNavIn on page navigated to
     * @param {onPageNav} onPageNavOut on page navigated out
     */
    constructor (pageName, onPageNavIn, onPageNavOut) {
        super()
        this.onNotify = this.onSetPage
        this.pageName = pageName
        this.onPageNavIn = onPageNavIn
        this.onPageNavOut = onPageNavOut
    }

    /**
     * Trigger navigation page events.
     * @param {PageController} pageController observed page controller
     * @param {string} action page controller action
     */
    onSetPage (pageController, action) {
        console.log(this)
        if (pageController.currentPageName === this.pageName) {
            switch (action) {
            case 'pop':
                this.onPageNavOut(pageController.containerElement)
                break
            case 'push':
                this.onPageNavIn(pageController.containerElement)
                break
            }
        }
    }
}

export default PageObserver
