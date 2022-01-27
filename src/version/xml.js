const core = require('@actions/core')
const objectPath = require('object-path')

const BaseVersioning = require('./base')
const bumpVersion = require('../helpers/bumpVersion')

const xml2js = require('xml2js')

module.exports = class Xml extends BaseVersioning {

  /**
   * Bump the version in XML files
   *
   * @param {!string} releaseType - The type of release
   * @return {*}
   */
   bump = async (releaseType) => {
    // Read the file
    const fileContent = this.read()

    // Parse the file
    let jsonContent

    await xml2js.parseStringPromise(fileContent, { explicitArray: false }).then(function (result) {
      jsonContent = result
    })
    .catch(function (err) {
      core.startGroup('Error when parsing the XML file!')
      core.info(`File-Content: ${fileContent}`)
      core.info(err)
      core.endGroup()

      jsonContent = {}
    });

    core.info(`json-Content: ${JSON.stringify(jsonContent)}`)
    // Get the old version
    const oldVersion = objectPath.get(jsonContent, this.versionPath, null)

    // Get the new version
    this.newVersion = await bumpVersion(
      releaseType,
      oldVersion,
    )

    if(this.skipVersionFile) {
      return
    }

    core.info(`Bumped file "${this.fileLocation}" from "${oldVersion}" to "${this.newVersion}"`)

    // Update the content with the new version
    objectPath.set(jsonContent, this.versionPath, this.newVersion)

    var builder = new xml2js.Builder()
    var xml = builder.buildObject(jsonContent, null, 2)

    // Update the file
    this.update(xml)
  }
}
