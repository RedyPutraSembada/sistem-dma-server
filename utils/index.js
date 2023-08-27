const { Ability, AbilityBuilder } = require('@casl/ability');

function getToken(req) {
    let token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;

    return token && token.length ? token : null;
}

//* policy 
const policies = {
    coAdmin(user, { can }) {
        can('index', 'Product');
        can('index', 'User');
    },
    admin(user, { can }) {
        can('manage', 'all');
    }
}

const policyFor = user => {
    let builder = new AbilityBuilder();
    if (user && typeof policies[user.role] === 'function') {
        policies[user.role](user, builder);
    } else {
        return 'blm_login'
    }
    return new Ability(builder.rules)
}

module.exports = { getToken, policyFor }