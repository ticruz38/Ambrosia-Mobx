import Room from './Room';

const User =  `
    type User {
        _id: String!
        name: String
        email: String!
        password: String! #hash256 password
        room: Room #user rooms listed by Id
    }
`;

export default () => [User, Room];