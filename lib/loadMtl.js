'use strict';
var path = require('path');
var Material = require('./Material');
var readLines = require('./readLines');

module.exports = loadMtl;

/**
 * Parse an mtl file.
 *
 * @param {String} mtlPath Path to the mtl file.
 * @param {Object} options An object with the following properties:
 * @param {Boolean} options.metallicRoughness The values in the mtl file are already metallic-roughness PBR values and no conversion step should be applied. Metallic is stored in the Ks and map_Ks slots and roughness is stored in the Ns and map_Ns slots.
 * @returns {Promise} A promise resolving to the materials.
 *
 * @private
 */
function loadMtl(mtlPath, options) {
    var material;
    var values;
    var value;
    var mtlDirectory = path.dirname(mtlPath);
    var materials = [];

    var defaultSpecularShininess = 0.0;
    if (options.metallicRoughness) {
        defaultSpecularShininess = 1.0; // Fully rough
    }

    function parseLine(line) {
        line = line.trim();
        if (/^newmtl /i.test(line)) {
            var name = line.substring(7).trim();
            material = new Material();
            material.name = name;
            material.specularShininess = defaultSpecularShininess;
            materials.push(material);
        } else if (/^Ka /i.test(line)) {
            values = line.substring(3).trim().split(' ');
            material.ambientColor = [
                parseFloat(values[0]),
                parseFloat(values[1]),
                parseFloat(values[2]),
                1.0
            ];
        } else if (/^Ke /i.test(line)) {
            values = line.substring(3).trim().split(' ');
            material.emissiveColor = [
                parseFloat(values[0]),
                parseFloat(values[1]),
                parseFloat(values[2]),
                1.0
            ];
        } else if (/^Kd /i.test(line)) {
            values = line.substring(3).trim().split(' ');
            material.diffuseColor = [
                parseFloat(values[0]),
                parseFloat(values[1]),
                parseFloat(values[2]),
                1.0
            ];
        } else if (/^Ks /i.test(line)) {
            values = line.substring(3).trim().split(' ');
            material.specularColor = [
                parseFloat(values[0]),
                parseFloat(values[1]),
                parseFloat(values[2]),
                1.0
            ];
        } else if (/^Ns /i.test(line)) {
            value = line.substring(3).trim();
            material.specularShininess = parseFloat(value);
        } else if (/^d /i.test(line)) {
            value = line.substring(2).trim();
            material.alpha = parseFloat(value);
        } else if (/^Tr /i.test(line)) {
            value = line.substring(3).trim();
            material.alpha = parseFloat(value);
        } else if (/^map_Ka /i.test(line)) {
            material.ambientTexture = path.resolve(mtlDirectory, line.substring(7).trim());
        } else if (/^map_Ke /i.test(line)) {
            material.emissiveTexture = path.resolve(mtlDirectory, line.substring(7).trim());
        } else if (/^map_Kd /i.test(line)) {
            material.diffuseTexture = path.resolve(mtlDirectory, line.substring(7).trim());
        } else if (/^map_Ks /i.test(line)) {
            material.specularTexture = path.resolve(mtlDirectory, line.substring(7).trim());
        } else if (/^map_Ns /i.test(line)) {
            material.specularShininessTexture = path.resolve(mtlDirectory, line.substring(7).trim());
        } else if (/^map_Bump /i.test(line)) {
            material.normalTexture = path.resolve(mtlDirectory, line.substring(9).trim());
        } else if (/^map_d /i.test(line)) {
            material.alphaTexture = path.resolve(mtlDirectory, line.substring(6).trim());
        }
    }

    return readLines(mtlPath, parseLine)
        .then(function() {
            return materials;
        });
}
