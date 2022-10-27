interface State {
  guessed: boolean;
  rightAnswer: boolean;
  streak: number;
}

interface Action {
  type: 'right' | 'wrong' | 'reset';
}

export const initialState: State = {
  guessed: false,
  rightAnswer: false,
  streak: 0,
};

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'right':
      return {
        rightAnswer: true,
        streak: state.streak + 1,
        guessed: true,
      };
    case 'wrong':
      return {
        rightAnswer: false,
        streak: 0,
        guessed: true,
      };
    case 'reset':
      return {
        rightAnswer: false,
        streak: state.streak,
        guessed: false,
      };
    default:
      return state;
  }
};
