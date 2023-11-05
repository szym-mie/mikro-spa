class FormController {
    /**
     * @constructor
     * @param {string} formId form id
     * @param {newFormEntry[]} entryFactories array of entry factories
     */
    constructor (formId, ...entryFactories) {
        this.formId = formId
        this.formElement = document.getElementById(formId)
        if (this.formElement === undefined) throw new TypeError('Could not find specified form.')
        console.log(this.formElement)
        this.entries = entryFactories.map(entryFactory => entryFactory(this))
    }

    /**
     * Get is form valid.
     * @return {boolean} is form valid
     */
    isValid () {
        return this.entries.every(entry => entry.isValid())
    }

    /**
     * Get entries map of isValid.
     * @return {Map<FormEntry, boolean>} validity map
     */
    getValidMap () {
        return new Map(this.entries.map(entry => [entry, entry.isValid()]))
    }

    /**
     * Get map of names and entry values.
     * @return {Map<string, string>} name - value map
     */
    getDataMap () {
        return new Map(this.entries.map(entry => entry.getNameValuePair()))
    }

    /**
     * Try sending form.
     */
    trySend () {
        if (this.isValid()) {
            console.log(this.getDataMap())
            // alert()
        } else {
            [...this.getValidMap().entries()]
                .map(([k, _v]) => k.trySetInvalid())
        }
    }

    /**
     * Get inputs by name from parent element.
     * @param {Element} element parent element
     * @param {string} name name of the inputs
     * @returns {HTMLInputElement[]} input elements
     */
    static getInputsByName (element, name) {
        return [...element.querySelectorAll('[name=' + name + ']')]
    }

    /**
     * Set entry from target value.
     * @param {FormEntry} entry form entry to set
     * @param {string} _id unused ID
     * @param {string} value target value
     */
    static setEntryValue (entry, _id, value) {
        entry.value = value
        entry.tryClearInvalid()
    }

    /**
     * @callback newFormEntry
     * @param {FormController} formElement querried form
     * @return {FormEntry} new form entry for that form
     */

    /**
     * Add text entry.
     * @param {string} entryName name of the input
     * @returns {newFormEntry} form entry factory
     */
    static textEntry (entryName) {
        return formController => new FormEntry(
            entryName,
            FormController.getInputsByName(formController.formElement, entryName),
            FormController.setEntryValue,
            null)
    }

    /**
     * Add radio entry.
     * @param {string} entryName name of the radios
     * @returns {newFormEntry} form entry factory
     */
    static radioEntry (entryName) {
        return formController => new FormEntry(
            entryName,
            FormController.getInputsByName(formController.formElement, entryName),
            FormController.setEntryValue,
            null)
    }

    /**
     * @callback entryAction
     * @param {FormEntry} entry
     */

    /**
     * Add button entry.
     * @param {string} entryName name of the button
     * @param {entryAction} action
     * @returns {newFormEntry}
     */
    static buttonEntry (entryName, action) {
        return formController => new FormEntry(
            entryName,
            FormController.getInputsByName(formController.formElement, entryName),
            null,
            action)
    }
}

class FormEntry {
    /**
     * @callback onChange
     * @param {FormEntry} entry event entry to set
     * @param {string} targetName element name of the target
     * @param {string} targetValue value of the input
     * @return {void}
     */

    /**
     * @callback onClick
     * @param {FormEntry} entry event entry bound to action
     * @return {void}
     */

    /**
     * @constructor
     * @param {Element[]} elements element inputs to be watched
     * @param {onChange|null} onChange triggered on input changed
     * @param {onClick|null} onClick triggered on input clicked
     */
    constructor (name, elements, onChange, onClick) {
        console.log(name, elements, onChange, onClick)
        this.name = name
        this.elementMap = new Map(elements.map(elem => [elem.id, elem]))
        this.value = undefined

        elements.forEach(elem => {
            if (onChange !== null) {
                elem.addEventListener(
                    'change',
                    event => { onChange(this, event.target.name, event.target.value) },
                    false)
            }
            if (onClick !== null) {
                elem.addEventListener(
                    'click',
                    _event => { onClick(this) },
                    false)
            }
        })
    }

    /**
     * Get element by ID.
     * @param {string} id ID of the element
     * @return {Element} associated element
     */
    getElement (id) {
        return this.elementMap.get(id)
    }

    /**
     * Get entry elements.
     * @return {Element[]} entry elements.
     */
    getElementValues () {
        return [...this.elementMap.values()]
    }

    /**
     * Get name and value pair.
     * @return {string[]} name, value pair
     */
    getNameValuePair () {
        return [this.name, this.value]
    }

    /**
     * Check if entry is valid.
     * @return {boolean} is entry valid
     */
    isValid () {
        return this.getElementValues()
            .every(elem => elem.checkValidity())
    }

    trySetInvalid () {
        const isValid = this.isValid()
        this.elementMap.forEach(elem => {
            const classList = elem.classList
            if (!isValid) classList.add('invalid')
        })
    }

    tryClearInvalid () {
        const isValid = this.isValid()
        this.elementMap.forEach(elem => {
            const classList = elem.classList
            if (isValid) classList.remove('invalid')
        })
    }

    /**
     * Check if value is set.
     * @return {boolean} is entry value set
     */
    isSet () {
        return this.value !== undefined
    }
}

export default FormController
