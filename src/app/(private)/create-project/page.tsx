export default function CreateProject() {
  return <></>;
}

// We need a page to connect to Git provider (Github | Gitlab | Bitbucket) 

/**
 * First screen (Get source code):
 *  - Should have two tabs (Git Provider | Public Git Repository)
 *      - Git Provider
 *          - should have a title and description (is should be about connect your provider)
 *          - should have some have some button to connect to (Github | Gitlab | Bitbucket)
 *          - Focus on connecting Github provider
 *          - Gitlab | Bitbucket button should have a coming soon tag
 *          - Once provider has been connect is should show a list repos is a select field
 *      - Public Git Repository
 *          - Should have a url field for a pubic url
 *          - Validate url field make sure it either coming from github, gitlab or bitbucket
 *          - There should be a connect button to check if we can connect to the public url
 * Second screen (Project details)
 *  - Name field: this should be the project, should be first updated when user either select a repo or connect a public git repository
 *  - Branch field: this should be a list of branch for the selected git repo, it should be a select field (default main/master)
 *  - Root directory (Optional):
 *  - Build command: The will be the command use to build the app
 *  - Environment variable Section:
 *      - should contain: name field and value
 *      - should have a button to add Environment variable
 *      - should have a button to add from .env
 *  - Auto deploy field: should be a select field this is to determine when to deploy either (on commit, on PR open, etc) or just disable it
 *  - Deploy Button
 *
 * Third screen:
 *  - Should have a collasible section which shows the Build logs and Deployment summary
 *  - On deployment successful show a congratulation screen else a failed screen
 */