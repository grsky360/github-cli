import client from '../utils/GithubApi'
import user from './User'

const repo = new class Repo {

    newRepo = async () => {
        await user.login()
    }

}

export default repo
