'use strict';

var async = require('async'),
    _ = require('lodash'),

    /**
     * Method getSearchableFields
     * Returns an array of fieldNames based on DataTable params object
     * All columns in params.columns that have .searchable == true field will have the .data param returned in an String
     * array. The .data property is used because in angular frontend DTColumnBuilder.newColumn('str') puts 'str' in the
     * data field, instead of the name field.
     * @param params
     * @returns {Array}
     */
    getSearchableFields = function (params) {
        return params.columns.filter(function (column) {
            return JSON.parse(column.searchable);
        }).map(function (column) {
            return column.data;
        });
    },

    /**
     * Method isNaNorUndefined
     * Checks if any of the passed params is NaN or undefined.
     * Used to check DataTable's properties draw, start and length
     * @returns {boolean}
     */
    isNaNorUndefined = function () {
        var args = Array.prototype.slice.call(arguments);
        return args.some(function (arg) {
            return isNaN(arg) || (!arg && arg !== 0);
        });
    },

    /**
     * Methdd buildFindParameters
     * Builds a MongoDB find expression based on DataTables param object
     * - If no search text if provided (in params.search.value) an empty object is returned, meaning all data in DB will
     * be returned.
     * - If only one column is searchable (that means, only one params.columns[i].searchable equals true) a normal one
     * field regex MongoDB query is returned, that is {`fieldName`: new Regex(params.search.value, 'i'}
     * - If multiple columns are searchable, an $or MongoDB is returned, that is:
     * ```
     * {
     *     $or: [
     *         {`searchableField1`: new Regex(params.search.value, 'i')},
     *         {`searchableField2`: new Regex(params.search.value, 'i')}
     *     ]
     * }
     * ```
     * and so on.<br>
     * All search are by regex so the field param.search.regex is ignored.
     * @param params DataTable params object
     * @returns {*}
     */
    buildFindParameters = function (params, Model) {

        if (!params || !params.columns || !params.search || (!params.search.value && params.search.value !== '')) {
            return null;
        }

        var searchText = params.search.value,
            findParameters = {},
            searchRegex = null,
            searchRegexContains = null,
            searchOrArray = [];
        var isValid = true, isValid1 = true;
        try {
            new RegExp("^" + searchText, "i");
        } catch (e) {
            isValid = false;
        }
        if (isValid) searchRegex = { $regex: new RegExp("^" + searchText, "i") };
        try {
            new RegExp("^" + searchText, "i");
        } catch (e) {
            isValid1 = false;
        }
        if (isValid1) searchRegexContains = { $regex: new RegExp(".*" + searchText + ".*", "i") };

        if (searchText === '' || !isValid) {
            return findParameters;
        }
        var searchableFieldsDefault = getSearchableFields(params);
        var searchableFields = [];
        if (Array.isArray(searchableFieldsDefault)) {

            searchableFieldsDefault.forEach((field) => {
                if (Model.schema.paths[field] && Model.schema.paths[field].instance === "String") {
                    searchableFields.push(field);
                };
            });
        };
        searchableFields.forEach(function (field) {
            if (searchRegex) {
                var orCondition = {};
                orCondition[field] = searchRegex;
                searchOrArray.push(orCondition);
            };
            if (searchRegexContains) {
                var orCondition1 = {};
                orCondition1[field] = searchRegexContains;
                searchOrArray.push(orCondition1);
            }
        });
        if (searchOrArray.length !== 0) findParameters.$or = searchOrArray;
        return findParameters;
    },

    /**
     * Method buildSortParameters
     * Based on DataTable parameters, this method returns a MongoDB ordering parameter for the appropriate field
     * The params object must contain the following properties:
     * order: Array containing a single object
     * order[0].column: A string parseable to an Integer, that references the column index of the reference field
     * order[0].dir: A string that can be either 'asc' for ascending order or 'desc' for descending order
     * columns: Array of column's description object
     * columns[i].data: The name of the field in MongoDB. If the index i is equal to order[0].column, and
     * the column is orderable, then this will be the returned search param
     * columns[i].orderable: A string (either 'true' or 'false') that denotes if the given column is orderable
     * @param params
     * @returns {*}
     */
    buildSortParameters = function (params) {
        if (!params || !Array.isArray(params.order) || params.order.length === 0) {
            return null;
        }
        else {
            var data = {};
            for (let index = 0; index < params.order.length; index++) {
                var sortColumn = Number(params.order[index].column),
                    sortOrder = params.order[index].dir,
                    sortField;
                if (isNaNorUndefined(sortColumn) || !Array.isArray(params.columns) || sortColumn >= params.columns.length) {
                    // return null;
                };
                if (params.columns[sortColumn].orderable === 'false') {
                    // return null;
                };
                sortField = params.columns[sortColumn].data;
                if (!sortField) {
                    // return null;
                };
                var isPopulate = false;
                if (params.columns) {
                    params.columns.forEach(function (item) {
                        if (item.isPopulate == true) {
                            isPopulate = true;
                        }
                    });
                };
                if (sortOrder === 'asc' && params.aggregate) {
                    data[sortField] = 1;
                } else if (sortOrder === 'desc' && params.aggregate) {
                    data[sortField] = -1;
                } else if (sortOrder === 'asc' && isPopulate) {
                    data[sortField] = 1;
                } else if (sortOrder === 'desc' && isPopulate) {
                    data[sortField] = -1;
                }
                else if (sortOrder === 'asc') {
                    data[sortField] = 1;
                } else if (sortOrder === 'desc') {
                    data[sortField] = -1;
                }
                else {
                }

            }
            return data;
        }
    },

    buildSelectParameters = function (params) {
        if (!params || !params.columns || !Array.isArray(params.columns)) {
            return null;
        }
        return params
            .columns
            .map(col => col.data)
            .reduce((selectParams, field) => {
                selectParams[field] = 1;
                return selectParams;
            }, {});
    },

    buildConditions = function (columns) {
        var data = {};
        if (!columns) {
            return {};
        } else {
            columns.forEach(function (item) {
                if (item.search.value !== '') {
                    let keyName = item.data;
                    Object.assign(data, {
                        [keyName]: item.search.value
                    });
                }
            });
            return data;
        }
    },
    buildPopulateParameters = function (params) {
        var dataArray = [];
        if (!params) {
            return {};
        } else {
            params.forEach(function (item) {
                if (item.isPopulate == true) {
                    dataArray.push(item.data);
                }
            });
            var sendPop = dataArray.join(' ');
            return sendPop;
        }
    },
    buildPopulateFields = function (params) {
        var dataArray = [];
        if (!params) {
            return {};
        } else {
            params.forEach(function (item) {
                if (item.isPopulate == true) {
                    dataArray.push(item.populateFields);
                }
            });
            var sendPop = dataArray.join(' ');
            return sendPop;
        }
    },
    
    checkPopulate = function (params) {
        var isPopulate = false;
        if (!params) {
            return isPopulate;
        } else {
            params.forEach(function (item) {
                if (item.isPopulate == true) {
                    isPopulate = true;
                }
            });
            return isPopulate;
        }
    },
    /**
     * Run wrapper function
     * Serves only to the Model parameter in the wrapped run function's scope
     * @param {Object} Model Mongoose Model Object, target of the search
     * @returns {Function} the actual run function with Model in its scope
     */
    run = function (Model) {

        /**
         * Method Run
         * The actual run function
         * Performs the query on the passed Model object, using the DataTable params argument
         * @param {Object} params DataTable params object
         */
        return function (params) {
            return new Promise(function (fullfill, reject) {
                var draw = Number(params.draw),
                    start = Number(params.start),
                    length = Number(params.length),
                    findParameters = buildFindParameters(params, Model),
                    conditions = buildConditions(params.columns),
                    sortParameters = buildSortParameters(params),
                    selectParameters = buildSelectParameters(params),
                    populateParameters = buildPopulateParameters(params.columns),
                    populateFields = buildPopulateFields(params.columns),
                    isPopulate = checkPopulate(params.columns),
                    recordsTotal,
                    recordsFiltered,
                    occupation = [];
                
                async.series([
                    function checkParams(cb) {
                        if (isNaNorUndefined(draw, start, length)) {
                            return cb(new Error('Some parameters are missing or in a wrong state. ' +
                                'Could be any of draw, start or length'));
                        }

                        if (!findParameters || !sortParameters || !selectParameters) {
                            return cb(new Error('Invalid findParameters or sortParameters or selectParameters'));
                        }
                        cb();
                    },
                    function fetchRecordsTotal(cb) {
                        Model.countDocuments({}, function (err, count) {
                            if (err) {
                                return cb(err);
                            }
                            recordsTotal = count;
                            cb();
                        });
                    },
                    function fetchRecordsFiltered(cb) {
                        var findParameter;
                        if (Object.values(findParameters).length !== 0) {
                            findParameter = {
                                "$and": [conditions,
                                    {
                                        "$or": findParameters.$or
                                    }
                                ]
                            };
                        } else {
                            findParameter = {
                                "$and": [conditions]
                            };
                        }

                        if (params.aggregate) {
                            Model.find({
                                masterType: params.masterType
                            },
                                {
                                    groupName: 1
                                }).exec(function (err, results) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    var arr = [];
                                    results.forEach(function (grp) {
                                        //add only unique
                                        if (!arr.includes(grp.groupName) && grp.groupName != '') {
                                            arr.push(grp.groupName);
                                        }

                                    });
                                    // console.log("Rows:--- ", arr.length);
                                    recordsFiltered = arr.length;
                                    cb();
                                });
                        } else {
                            Model.countDocuments(findParameter, function (err, count) {
                                if (err) {
                                    return cb(err);
                                }
                                recordsFiltered = count;
                                cb();
                            });
                        }


                    },
                    function runQuery(cb) {
                        var findParameter;
                        if (Object.values(findParameters).length !== 0) {
                            findParameter = {
                                "$and": [conditions,
                                    {
                                        "$or": findParameters.$or
                                    }
                                ]
                            };
                        } else {
                            findParameter = {
                                "$and": [conditions]
                            };
                        }
                        if (params.aggregate) {
                            Model.aggregate([{
                                $match: {
                                    masterType: params.masterType,
                                }
                            },
                            {
                                $group: {
                                    _id: params.groupBy,
                                    remark: {
                                        $first: '$remark'
                                    },
                                    total: {
                                        $sum: 1
                                    }
                                }
                            },
                            {
                                $skip: start
                            },
                            {
                                $limit: length
                            },
                            {
                                $sort: sortParameters
                            },
                            {
                                $project: {
                                    remark: 1,
                                    total: 1
                                }
                            }]).exec(function (err, results) {
                                if (err) {
                                    return cb(err);
                                }
                                cb(null, {
                                    draw: draw,
                                    recordsTotal: recordsTotal,
                                    recordsFiltered: recordsFiltered,
                                    data: results
                                });
                            });
                        }
                        else if (isPopulate) {
                            Model
                                .find(findParameter)
                                // .populate(populateAll.path)
                                .populate(populateParameters, populateFields)
                                // .select(selectParameters)
                                .limit(length)
                                .skip(start)
                                .sort(sortParameters).lean()
                                .exec(function (err, results) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    cb(null, {
                                        draw: draw,
                                        recordsTotal: recordsTotal,
                                        recordsFiltered: recordsFiltered,
                                        data: results
                                    });
                                });
                        } else {
                            Model
                                .find(findParameter)
                                .select(selectParameters)
                                .limit(length)
                                .skip(start)
                                .sort(sortParameters)
                                .exec(function (err, results) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    cb(null, {
                                        draw: draw,
                                        recordsTotal: recordsTotal,
                                        recordsFiltered: recordsFiltered,
                                        data: results
                                    });
                                });
                        }
                    }
                ], function resolve(err, results) {
                    if (err) {
                        reject({
                            error: err
                        });
                    } else {
                        var answer = results[results.length - 1];
                        fullfill(answer);
                    }
                });
            });
        };
    },

    /**
     * Module datatablesQuery
     * Performs queries in the given Mongoose Model object, following DataTables conventions for search and
     * pagination.
     * The only interesting exported function is `run`. The others are exported only to allow unit testing.
     * @param Model
     * @returns {{run: Function, isNaNorUndefined: Function, buildFindParameters: Function, buildSortParameters:
     *     Function}}
     */
    datatablesQuery = function (Model) {
        return {
            run: run(Model),
            isNaNorUndefined: isNaNorUndefined,
            buildFindParameters: buildFindParameters,
            buildSortParameters: buildSortParameters,
            buildSelectParameters: buildSelectParameters
        };
    };

module.exports = datatablesQuery;