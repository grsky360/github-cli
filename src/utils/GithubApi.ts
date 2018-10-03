import Octokit from '@octokit/rest'
import user from '../commands/User'
import { autobind } from 'core-decorators';

type Option = {
}
class LoginRequred {
    hasLogined = false
    check(option: Option = {}) {
        let self = this
        return function (target, key: string, descriptor: PropertyDescriptor) {
            if (!self.hasLogined) {
                let origin = descriptor.value
                descriptor.value = async (...args) => {
                    await user.login()
                    self.hasLogined = true
                    return origin.apply(target, args)
                }
            }
            return descriptor
        }
    }
    username() {
        return user.action.store().username
    }
}

const octokit = new Octokit()
const loginRequred = new LoginRequred
export {
    octokit as default,
    loginRequred
} 
