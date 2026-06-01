type modalStateType = {
	settings: boolean,
}

let modalStates = $state<modalStateType>({
	settings: false,
})
const openModal = (modalName: keyof modalStateType) => {
	modalStates[modalName] = true;
}

const closeModal = (modalName: keyof modalStateType) => {
	modalStates[modalName] = false;
}

const getModalState = (modalName: keyof modalStateType) => {
	return modalStates[modalName];
}

const setModalState = (modalName: keyof modalStateType, state: boolean) => {
	modalStates[modalName] = state;
}

export { modalStates, openModal, closeModal, getModalState, setModalState };