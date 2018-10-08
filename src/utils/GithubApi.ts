import Octokit from '@octokit/rest'
import user from '../commands/User'

export default new Octokit()

type Option = {
}
export const loginRequired = new class LoginRequired {
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

export function filterFields<T>(source: T | T[], fields: (keyof(T))[] = []): T | T[] | any {
    const filter = (source: T): T => {
        let target = {} as T
        if (fields && fields.length) {
            fields.map(field => {
                if (source[field] !== undefined) {
                    target[field] = source[field]
                }
            })
        } else {
            for (let field in source) {
                target[field] = source[field]
            }
        }
        return target
    }

    if (source instanceof Array) {
        let target = [] as T[]
        let s = <T[]>source
        s.map(item => target.push(filter(item)))
        return target
    } else {
        return filter(source)
    }
}
