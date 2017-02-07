import React from 'react';
import ReactDOM from 'react-dom';

const selectInputText = (element, type) => {
  element.setSelectionRange(0, element.value.length);
}

export default class InlineEdit extends React.Component {
    static propTypes = {
        text: React.PropTypes.any.isRequired,
        paramName: React.PropTypes.string.isRequired,
        change: React.PropTypes.func.isRequired,
        placeholder: React.PropTypes.string,
        className: React.PropTypes.string,
        activeClassName: React.PropTypes.string,
        minLength: React.PropTypes.number,
        maxLength: React.PropTypes.number,
        validate: React.PropTypes.func,
        style: React.PropTypes.object,
        editingElement: React.PropTypes.string,
        staticElement: React.PropTypes.string,
        tabIndex: React.PropTypes.number,
        isDisabled: React.PropTypes.bool,
        editing: React.PropTypes.bool,
        type: React.PropTypes.string,
        format: React.PropTypes.func,
        step: React.PropTypes.integer,
        min: React.PropTypes.integer
    };

    static defaultProps = {
        minLength: 0,
        maxLength: 256,
        editingElement: 'input',
        staticElement: 'span',
        tabIndex: 0,
        isDisabled: false,
        editing: false,
        type: "text",
        placeholder: 0,
        step: 0,
        min: 1,
        format: text => text
    };

    state = {
        editing: this.props.editing,
        text: this.props.text,
        minLength: this.props.minLength,
        maxLength: this.props.maxLength,
        type: this.props.type,
    };

    componentWillMount() {
        this.isInputValid = this.props.validate || this.isInputValid;
        // Warn about deprecated elements
        if (this.props.element) {
            console.warn('`element` prop is deprecated: instead pass editingElement or staticElement to InlineEdit component');
        }
    }

    componentWillReceiveProps(nextProps) {
        const isTextChanged = (nextProps.text !== this.props.text);
        const isEditingChanged = (nextProps.editing !== this.props.editing);
        let nextState = {};
        if (isTextChanged) {
            nextState.text = nextProps.text;
        }
        if (isEditingChanged) {
            nextState.editing = nextProps.editing;
        }
        if (isTextChanged || isEditingChanged) {
            this.setState(nextState);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let inputElem = this.nameInput;
        if (this.state.editing && !prevState.editing) {
          setTimeout(() => {
            inputElem.focus()
          }, 50);
          selectInputText(inputElem, this.props.type);

        } else if (this.state.editing && prevProps.text != this.props.text) {
          this.finishEditing();
        }
    }

    startEditing = (e) => {
        if (this.props.stopPropagation) {
            e.stopPropagation()
        }
        this.setState({editing: true, text: this.props.text});
    };

    finishEditing = () => {
        if (this.isInputValid(this.state.text) && this.props.text != this.state.text){
            this.commitEditing();
        } else if (this.props.text === this.state.text || !this.isInputValid(this.state.text)) {
            this.cancelEditing();
        }
    };

    cancelEditing = () => {
        this.setState({editing: false, text: this.props.text});
    };

    commitEditing = () => {
        this.setState({editing: false, text: this.state.text});
        let newProp = {};
        newProp[this.props.paramName] = this.state.text;
        this.props.change(newProp);
    };

    clickWhenEditing = (e) => {
        if (this.props.stopPropagation) {
            e.stopPropagation();
        }
    };

    isInputValid = (text) => {
        return (text.length >= this.state.minLength && text.length <= this.state.maxLength);
    };

    keyDown = (event) => {
        if (event.keyCode === 13) {
            this.finishEditing();
        } else if (event.keyCode === 27) {
            this.cancelEditing();
        }
    };

    textChanged = (event) => {
        this.setState({
            text: event.target.value.trim()
        });
    };

    render() {
        if (this.props.isDisabled) {
          const Element = this.props.element || this.props.staticElement;
          console.log("IS DISABLED")
          console.log(this)
          return <Element
              className={this.props.className}
              style={this.props.style} >
              {this.state.text || this.props.placeholder}
          </Element>;
        } else if (!this.state.editing) {
            const Element = this.props.element || this.props.staticElement;
            return <Element
                className={this.props.className}
                onKeyDown={this.startEditing}
                onClick={this.startEditing}
                tabIndex={this.props.tabIndex}
                style={this.props.style} >
                {this.props.format(this.state.text) || this.props.placeholder}
            </Element>;
        } else {
            const Element = this.props.element || this.props.editingElement;
            return(<Element
                      onClick={this.clickWhenEditing}
                      onKeyDown={this.keyDown}
                      onBlur={this.finishEditing}
                      placeholder={this.props.placeholder}
                      className={this.props.activeClassName}
                      defaultValue={this.state.text}
                      onChange={this.textChanged}
                      type={this.state.type}
                      style={this.props.style}
                      step={this.props.step}
                      min={this.props.mnin}
                      ref={(input) => { this.nameInput = input; }} />);
        }
    }
}
