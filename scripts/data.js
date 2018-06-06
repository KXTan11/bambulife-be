module.exports = {
    users: [{
        id:1,
        name: 'user 1',
        profileId: 1
    }],
    profiles: [{
        id:1,
        type: 'A',
        minScore: 8
    }, {
        id:2,
        type: 'B',
        minScore: 6
    }, {
        id:3,
        type: 'C',
        minScore: 4
    }, {
        id:4,
        type: 'D',
        minScore: 2
    }],
    questions: [{
        id:1,
        question: 'Saving amount'
    }, {
        id:2,
        question: 'Loan amount'
    }],
    answers: [{
        id: 1,
        value: 0,
        score: 1,
        questionId: 1
    }, {
        id: 2,
        value: 2000,
        score: 2,
        questionId: 1
    }, {
        id: 3,
        value: 4000,
        score: 3,
        questionId: 1
    }, {
        id: 4,
        value: 6000,
        score: 4,
        questionId: 1
    }, {
        id: 5,
        value: 8000,
        score: 5,
        questionId: 1
    }, {
        id: 6,
        value: 0,
        score: 5,
        questionId: 2
    }, {
        id: 7,
        value: 2000,
        score: 4,
        questionId: 2
    }, {
        id: 8,
        value: 4000,
        score: 3,
        questionId: 2
    }, {
        id: 9,
        value: 6000,
        score: 2,
        questionId: 2
    }, {
        id: 10,
        value: 8000,
        score: 1,
        questionId: 2
    }]
};