/* eslint-disable @typescript-eslint/no-explicit-any */

type Handle = any;

/**
 * matches HK_OnSnapshotCallback in firelite.h
 */
export type WatchCallback = (collection: string, path: string, kind: number) => void;

export interface NativeBindings {
  engineOpen(path: string): Handle;
  engineIsIndexesReady(engine: Handle): boolean;
  engineOpenWithConfig(path: string, config: Handle): Handle;
  engineFree(engine: Handle): void;
  engineBackup(engine: Handle, path: string): number; // Added
  engineCompact(engine: Handle): number;
  engineGetStats(engine: Handle): string | null;
  engineGetAuditLog(engine: Handle): string | null;
  engineSnapshotIndices(engine: Handle): number;
  engineListIndexes(engine: Handle, collection: string | null): string | null;

  // Configuration Builder
  configNew(): Handle;
  configFree(config: Handle): void;
  configSetDurability(config: Handle, mode: number): void;
  configSetEncryptionKey(config: Handle, key: string | null): void;
  configSetEncryptedCollections(config: Handle, collectionsJson: string | null): number;
  configSetAuditLog(config: Handle, enabled: boolean, path: string | null): void;
  configSetQueryWorkers(config: Handle, count: number): void;
  configSetMemoryLimits(config: Handle, mmap: number, maxInlined: number): void;
  configSetStorageTuning(
    config: Handle, 
    pageSize: number, 
    threshold: number, 
    groupCommit: number
  ): void;
  configSetBlobThreshold(config: Handle, thresholdBytes: number): void;
  configSetCompression(config: Handle, enabled: boolean, level: number): void;
  configSetBackgroundMaintenance(config: Handle, enabled: boolean): void;

  // Real-time Watch
  engineWatch(engine: Handle, collection: string, callback: WatchCallback): Handle;
  watchFree(watch: Handle): void;

  // Document Builder
  docNew(): Handle;
  docFree(doc: Handle): void;
  docInsertStr(doc: Handle, key: string, value: string): number;
  docInsertInt(doc: Handle, key: string, value: number | bigint): number;
  docInsertFloat(doc: Handle, key: string, value: number): number;
  docInsertBool(doc: Handle, key: string, value: boolean): number;
  docInsertNull(doc: Handle, key: string): number;
  docInsertBin(doc: Handle, key: string, bytes: Uint8Array): number;
  docInsertTimestamp(doc: Handle, key: string, micros: bigint): number; // Added
  docInsertServerTimestamp(doc: Handle, key: string): number; // Added
  docInsertReference(doc: Handle, key: string, targetCollection: string, targetId: string): number;
  docToJson(doc: Handle): string | null;

  // Engine CRUD
  engineInsert(engine: Handle, collection: string, docId: string, doc: Handle): number;
  engineGet(engine: Handle, collection: string, docId: string): Handle;
  engineDelete(engine: Handle, collection: string, docId: string): number;
  engineDeleteLocal(engine: Handle, collection: string, docId: string): number;
  engineSetCollectionLocal(engine: Handle, collection: string, local: number): number;
  engineReplicateKey(engine: Handle, collection: string, docId: string): number;
  engineReplicateCollection(engine: Handle, collection: string): number;
  engineVacuumCollection(engine: Handle, collection: string): number;
  enginePatch(engine: Handle, collection: string, docId: string, updates: Handle): number;
  engineInsertSubDoc(engine: Handle, col: string, id: string, subCol: string, subId: string, doc: Handle): number;
  engineGetByRef(engine: Handle, doc: Handle, fieldKey: string): Handle;
  engineCreateIndex(engine: Handle, collection: string, fieldsJson: string): number;

  // Atomic Batch
  batchNew(): Handle;
  batchFree(batch: Handle): void;
  batchSet(batch: Handle, collection: string, docId: string, doc: Handle): number;
  batchDelete(batch: Handle, collection: string, docId: string): number;
  batchCommit(engine: Handle, batch: Handle): number;

  // Serializable Transactions
  transactionBegin(engine: Handle): Handle;
  transactionGet(engine: Handle, tx: Handle, collection: string, docId: string): Handle;
  transactionSet(tx: Handle, collection: string, docId: string, doc: Handle): number;
  transactionCommit(engine: Handle, tx: Handle): number;
  transactionFree(tx: Handle): void;

  // Query API
  queryNew(collection: string): Handle;
  queryFree(query: Handle): void;
  queryWhereEqStr(query: Handle, field: string, value: string): number;
  queryWhereEqBool(query: Handle, field: string, value: boolean): number;
  queryWhereEqInt(query: Handle, field: string, value: number | bigint): number;
  queryWhereNeStr(query: Handle, field: string, value: string): number;
  queryWhereNeInt(query: Handle, field: string, value: number | bigint): number;
  queryWhereGtStr(query: Handle, field: string, value: string): number;
  queryWhereGtInt(query: Handle, field: string, value: number | bigint): number;
  queryWhereGteStr(query: Handle, field: string, value: string): number;
  queryWhereGteInt(query: Handle, field: string, value: number | bigint): number;
  queryWhereLtStr(query: Handle, field: string, value: string): number;
  queryWhereLtInt(query: Handle, field: string, value: number | bigint): number;
  queryWhereLteStr(query: Handle, field: string, value: string): number;
  queryWhereLteInt(query: Handle, field: string, value: number | bigint): number;
  queryOrderBy(query: Handle, field: string, ascending: boolean): number;
  queryLimit(query: Handle, limit: number): number;
  queryOffset(query: Handle, offset: number): number;
  querySelectField(query: Handle, field: string): number;
  queryExecute(engine: Handle, query: Handle): string | null;
  queryDelete(engine: Handle, query: Handle): number;
  queryDeleteLocal(engine: Handle, query: Handle): number;
  queryPatch(engine: Handle, query: Handle, patchDoc: Handle): number;
  queryExecuteToHandles(engine: Handle, query: Handle): Handle;
  resultSetCount(results: Handle): number;
  resultSetGetDoc(results: Handle, index: number): Handle;
  resultSetFree(results: Handle): void;
  resultSetToJson(results: Handle): string | null;
  // Raw result sets (v0.8.3): pinned bytes, not decoded docs. Rows are
  // resolved selectively via rawDocToDoc (decode only what you touch);
  // page with queryStartAfterRaw (no decode at all). rawDocBytes/Id need
  // backend memory reads — use resolve-then-read instead (see client.ts).
  queryExecuteRaw(engine: Handle, query: Handle): Handle;
  rawResultCount(results: Handle): number;
  rawResultGet(results: Handle, index: number): Handle;
  rawResultFree(results: Handle): void;
  rawDocToDoc(engine: Handle, rawDoc: Handle, collection: string): Handle;
  queryStartAfterRaw(query: Handle, anchorRawDoc: Handle): number;
  // Borrowed views (v0.8.11): lazy typed pulls, no owned construction.
  // Numeric/bool getters cross by value (no memory reads); strings and
  // walks stay on resolve/raw paths (documented in client.ts).
  viewGet(engine: Handle, collection: string, docId: string): Handle;
  viewFree(view: Handle): void;
  viewFieldCount(view: Handle): number;
  viewHasField(view: Handle, key: string): boolean;
  viewGetInt(view: Handle, key: string): number | bigint | null;
  viewGetFloat(view: Handle, key: string): number | null;
  viewGetBool(view: Handle, key: string): boolean | null;
  viewToDoc(view: Handle, docId: string): Handle;
  queryDeferBlobs(query: Handle, defer: boolean): number;
  docResolveBlobs(engine: Handle, collection: string, doc: Handle): number;
  engineInsertTake(engine: Handle, collection: string, docId: string, doc: Handle): number;
  configSetWalReserveBytes(c: Handle, bytes: number | bigint): void;

  // Full-Text Search Queries (Added)
  queryWhereMatch(query: Handle, field: string, value: string): number;
  queryWhereMatchPrefix(query: Handle, field: string, value: string): number;
  queryWhereContains(query: Handle, field: string, value: string): number;
  queryWhereStartsWith(query: Handle, field: string, value: string): number;
  queryWhereOrStr(query: Handle, field: string, value: string): number;
  queryWhereOrInt(query: Handle, field: string, value: number | bigint): number;

  // Aggregation API
  queryAggregateCount(query: Handle): number;
  queryAggregateSum(query: Handle, field: string): number;
  queryAggregateAvg(query: Handle, field: string): number;
  queryExecuteAggregation(engine: Handle, query: Handle): string | null;

  engineListCollections(engine: Handle): string | null;

  // Net Sync
  netSyncerNew(engine: Handle, name: string, roomKey: string): Handle;
  netSyncerStart(syncer: Handle, port: number): number;
  netSyncerSetDiscovery(syncer: Handle, mode: number): number;
  netSyncerStatus(syncer: Handle): string | null;
  netSyncerFree(syncer: Handle): void;

  // Cloud Sync (bi-directional WebSocket replication)
  cloudSyncNew(engine: Handle, mode: number, clientId: string | null, roomName: string | null, roomKey: string | null, authToken: string | null): Handle;
  cloudSyncServerNew(engine: Handle, serverId: string | null, authToken: string | null): Handle;
  cloudSyncClientNew(engine: Handle, clientId: string | null, roomName: string | null, roomKey: string | null, authToken: string | null): Handle;
  cloudSyncStart(cloudSync: Handle, address: string): number;
  cloudSyncStatus(cloudSync: Handle): string | null;
  cloudSyncStop(cloudSync: Handle): void;
  cloudSyncFree(cloudSync: Handle): void;

  // v0.5.9
  createFtsIndex(engine: Handle, collection: string, field: string): number;
  createSimpleIndex(engine: Handle, collection: string, field: string): number;
  
  // Array API
  arrayNew(): Handle;
  arrayFree(array: Handle): void;
  arrayAppendStr(array: Handle, value: string): number;
  arrayAppendInt(array: Handle, value: number | bigint): number;
  arrayAppendDoc(array: Handle, doc: Handle): number;

  // Nested structures
  docInsertDoc(parent: Handle, key: string, child: Handle): number;
  docInsertArray(parent: Handle, key: string, array: Handle): number;
  
  // Query extensions
  queryWhereIn(query: Handle, field: string, array: Handle): number;
  queryWhereNotIn(query: Handle, field: string, array: Handle): number;
  queryWhereArrayContainsAny(query: Handle, field: string, array: Handle): number;
  queryWhereArrayContainsStr(query: Handle, field: string, value: string): number;
  queryWhereArrayContainsInt(query: Handle, field: string, value: number | bigint): number;
  queryStartAfter(query: Handle, anchorDoc: Handle): number;
  queryStartAt(query: Handle, anchorDoc: Handle): number;
  queryEndAt(query: Handle, anchorDoc: Handle): number;
  queryEndBefore(query: Handle, anchorDoc: Handle): number;

  lastError(): string;
}

function isBunRuntime(): boolean {
  return typeof (globalThis as any).Bun !== 'undefined';
}

function defaultLibraryPath(): string {
  const libName = process.platform === 'win32' ? 'hakodb.dll' :
                  process.platform === 'darwin' ? 'libhakodb.dylib' : 'libhakodb.so';
  // Explicit path wins (loadNativeBindings(path)); otherwise the binary
  // shipped under ./native/ (populated by sync-native.* from a core
  // checkout or release asset). FIRELITE_LIB_PATH overrides both.
  const override = typeof process !== 'undefined' ? process.env.FIRELITE_LIB_PATH : undefined;
  if (override) return override;
  return `./native/${libName}`;
}

function resolveLibraryPath(explicitPath?: string): string {
  return explicitPath ?? defaultLibraryPath();
}

async function createBunBindings(libPath: string): Promise<NativeBindings> {
  const ffi = await import('bun:ffi');
  const { dlopen, FFIType, CString, JSCallback } = ffi as any;

  const symbols = dlopen(libPath, {
    hk_engine_open: { args: [FFIType.cstring], returns: FFIType.ptr },
    hk_engine_is_indexes_ready: { args: [FFIType.ptr], returns: FFIType.bool },
    hk_engine_open_with_config: { args: [FFIType.cstring, FFIType.ptr], returns: FFIType.ptr },
    hk_engine_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_engine_backup: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_compact: { args: [FFIType.ptr], returns: FFIType.i32 },
    hk_engine_get_stats: { args: [FFIType.ptr], returns: FFIType.ptr },
    hk_engine_get_audit_log: { args: [FFIType.ptr], returns: FFIType.ptr },
    hk_engine_snapshot_indices: { args: [FFIType.ptr], returns: FFIType.i32 },
    hk_engine_list_indexes: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.ptr },

    hk_config_new: { args: [], returns: FFIType.ptr },
    hk_config_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_config_set_durability: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
    hk_config_set_encryption_key: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
    hk_config_set_encrypted_collections: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_config_set_audit_log: { args: [FFIType.ptr, FFIType.bool, FFIType.cstring], returns: FFIType.void },
    hk_config_set_query_workers: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.void },
    hk_config_set_memory_limits: { args: [FFIType.ptr, FFIType.usize, FFIType.usize], returns: FFIType.void },
    hk_config_set_storage_tuning: { args: [FFIType.ptr, FFIType.usize, FFIType.usize, FFIType.usize], returns: FFIType.void },
    hk_config_set_blob_threshold: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.void },
    hk_config_set_compression: { args: [FFIType.ptr, FFIType.bool, FFIType.i32], returns: FFIType.void },
    hk_config_set_background_maintenance: { args: [FFIType.ptr, FFIType.bool], returns: FFIType.void },

    hk_engine_watch: { args: [FFIType.ptr, FFIType.cstring, FFIType.function, FFIType.ptr], returns: FFIType.ptr },
    hk_watch_free: { args: [FFIType.ptr], returns: FFIType.void },

    hk_doc_new: { args: [], returns: FFIType.ptr },
    hk_doc_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_doc_insert_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_doc_insert_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_doc_insert_float: { args: [FFIType.ptr, FFIType.cstring, FFIType.f64], returns: FFIType.i32 },
    hk_doc_insert_bool: { args: [FFIType.ptr, FFIType.cstring, FFIType.bool], returns: FFIType.i32 },
    hk_doc_insert_null: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_doc_insert_bin: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr, FFIType.usize], returns: FFIType.i32 },
    hk_doc_insert_timestamp: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_doc_insert_server_timestamp: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_doc_to_json: { args: [FFIType.ptr], returns: FFIType.ptr },

    hk_engine_insert: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_engine_get: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.ptr },
    hk_engine_delete: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_delete_local: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_set_collection_local: { args: [FFIType.ptr, FFIType.cstring, FFIType.i32], returns: FFIType.i32 },
    hk_engine_replicate_key: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_replicate_collection: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_vacuum_collection: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_patch: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_engine_insert_subdoc: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_engine_get_by_ref: { args: [FFIType.ptr, FFIType.ptr, FFIType.cstring], returns: FFIType.ptr },
    hk_engine_create_index: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.u32 },

    hk_batch_new: { args: [], returns: FFIType.ptr },
    hk_batch_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_batch_set: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_batch_delete: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_batch_commit: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },

    hk_transaction_begin: { args: [FFIType.ptr], returns: FFIType.ptr },
    hk_transaction_get: { args: [FFIType.ptr, FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.ptr },
    hk_transaction_set: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_transaction_commit: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_transaction_free: { args: [FFIType.ptr], returns: FFIType.void },

    hk_query_new: { args: [FFIType.cstring], returns: FFIType.ptr },
    hk_query_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_query_where_eq_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_eq_bool: { args: [FFIType.ptr, FFIType.cstring, FFIType.bool], returns: FFIType.i32 },
    hk_query_where_eq_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_ne_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_ne_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_gt_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_gt_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_gte_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_gte_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_lt_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_lt_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_lte_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_lte_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },
    hk_query_where_match: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_match_prefix: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_contains: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_starts_with: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_order_by: { args: [FFIType.ptr, FFIType.cstring, FFIType.bool], returns: FFIType.i32 },
    hk_query_limit: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.i32 },
    hk_query_offset: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.i32 },
    hk_query_select_field: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_query_execute: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
    hk_query_delete: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_delete_local: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_patch: { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_execute_to_handles: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
    hk_result_set_count: { args: [FFIType.ptr], returns: FFIType.usize },
    hk_result_set_get_doc: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.ptr },
    hk_result_set_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_result_set_to_json: { args: [FFIType.ptr], returns: FFIType.ptr },
    // Raw result sets (v0.8.3). All crossings are handles/strings/ints —
    // no (ptr,len) memory reads needed (anchor + resolve by handle).
    hk_query_execute_raw: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
    hk_rawresult_count: { args: [FFIType.ptr], returns: FFIType.usize },
    hk_rawresult_get: { args: [FFIType.ptr, FFIType.usize], returns: FFIType.ptr },
    hk_rawresult_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_query_start_after_raw: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_rawdoc_to_doc: { args: [FFIType.ptr, FFIType.ptr, FFIType.cstring], returns: FFIType.ptr },
    hk_query_defer_blobs: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.i32 },
    hk_doc_resolve_blobs: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_engine_insert_take: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_config_set_wal_reserve_bytes: { args: [FFIType.ptr, FFIType.u64], returns: FFIType.void },

    hk_query_aggregate_count: { args: [FFIType.ptr], returns: FFIType.i32 },
    hk_query_aggregate_sum: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_query_aggregate_avg: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_query_execute_aggregation: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
    hk_query_where_or_str: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_where_or_int: { args: [FFIType.ptr, FFIType.cstring, FFIType.i64], returns: FFIType.i32 },

    // v0.5.9
    // Indexing
    hk_engine_create_fts_index: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_engine_create_simple_index: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },

    // Array API
    hk_array_new: { args: [], returns: FFIType.ptr },
    hk_array_free: { args: [FFIType.ptr], returns: FFIType.void },
    hk_array_append_str: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_array_append_int: { args: [FFIType.ptr, FFIType.i64], returns: FFIType.i32 },
    hk_array_append_doc: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },

    // Nested structures
    hk_doc_insert_doc: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_doc_insert_array: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },

    // Query extensions
    hk_query_where_in: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_query_where_not_in: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_query_where_array_contains_any: { args: [FFIType.ptr, FFIType.cstring, FFIType.ptr], returns: FFIType.i32 },
    hk_query_where_array_contains: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },
    hk_query_start_after: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_start_at: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_end_at: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
    hk_query_end_before: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },

    hk_doc_insert_reference: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.cstring], returns: FFIType.i32 },

    hk_cloud_sync_new: { args: [FFIType.ptr, FFIType.i32, FFIType.cstring, FFIType.cstring, FFIType.cstring], returns: FFIType.ptr },
    hk_cloud_sync_server_new: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.ptr },
    hk_cloud_sync_client_new: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.cstring, FFIType.cstring], returns: FFIType.ptr },
    hk_cloud_sync_start: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.i32 },
    hk_cloud_sync_status: { args: [FFIType.ptr], returns: FFIType.ptr },
    hk_cloud_sync_stop: { args: [FFIType.ptr], returns: FFIType.void },
    hk_cloud_sync_free: { args: [FFIType.ptr], returns: FFIType.void },

    // ================= ERRORS =================
    hk_last_error: { args: [], returns: FFIType.ptr },
    hk_string_free: { args: [FFIType.ptr], returns: FFIType.void }

  }).symbols;

  const toC = (s: string | null) => s ? Buffer.from(s + '\0') : null;
  // ponytail: typed-array pointer for FFI out-params (i64/double reads).
  // Guarded: only view getters use it, and they throw a clear error on
  // ancient runtimes instead of a cryptic TypeError.
  const bunPtr = (ffi as any).ptr;
  const ptrOf = (arr: BigInt64Array | Float64Array): any => {
    if (!bunPtr) throw new Error('bun:ffi ptr() unavailable — upgrade Bun');
    return bunPtr(arr);
  };
  const ptrToStringAndFree = (ptr: any): string | null => {
    if (!ptr) return null;
    const text = new CString(ptr).toString();
    symbols.hk_string_free(ptr);
    return text;
  };

  return {
    engineOpen: (path) => symbols.hk_engine_open(toC(path)),
    engineIsIndexesReady: (engine) => symbols.hk_engine_is_indexes_ready(engine),
    engineOpenWithConfig: (path, config) => symbols.hk_engine_open_with_config(toC(path), config),
    engineFree: (engine) => symbols.hk_engine_free(engine),
    engineBackup: (e, p) => symbols.hk_engine_backup(e, toC(p)),
    engineCompact: (e) => symbols.hk_engine_compact(e),
    engineGetStats: (e) => ptrToStringAndFree(symbols.hk_engine_get_stats(e)),
    engineGetAuditLog: (e) => ptrToStringAndFree(symbols.hk_engine_get_audit_log(e)),
    engineSnapshotIndices: (e) => symbols.hk_engine_snapshot_indices(e),
    engineListIndexes: (e, c) => ptrToStringAndFree(symbols.hk_engine_list_indexes(e, toC(c))),

    configNew: () => symbols.hk_config_new(),
    configFree: (c) => symbols.hk_config_free(c),
    configSetDurability: (c, m) => symbols.hk_config_set_durability(c, m),
    configSetEncryptionKey: (c, k) => symbols.hk_config_set_encryption_key(c, toC(k)),
    configSetEncryptedCollections: (c, json) => symbols.hk_config_set_encrypted_collections(c, toC(json)),
    configSetAuditLog: (c, e, p) => symbols.hk_config_set_audit_log(c, e, toC(p)),
    configSetQueryWorkers: (c, count) => symbols.hk_config_set_query_workers(c, count),
    configSetMemoryLimits: (c, m, mi) => symbols.hk_config_set_memory_limits(c, m, mi),
    configSetStorageTuning: (c, ps, th, gc) => symbols.hk_config_set_storage_tuning(c, ps, th, gc),
    configSetBlobThreshold: (c, t) => symbols.hk_config_set_blob_threshold(c, t),
    configSetCompression: (c, e, l) => symbols.hk_config_set_compression(c, e, l),
    configSetBackgroundMaintenance: (c, e) => symbols.hk_config_set_background_maintenance(c, e),

    engineWatch: (engine, collection, callback) => {
      const cb = new JSCallback((c: any, p: any, kind: number) => {
        callback(new CString(c).toString(), new CString(p).toString(), kind);
      }, { args: [FFIType.ptr, FFIType.ptr, FFIType.i32], returns: FFIType.void });
      return symbols.hk_engine_watch(engine, toC(collection), cb, null);
    },
    watchFree: (watch) => symbols.hk_watch_free(watch),

    docNew: () => symbols.hk_doc_new(),
    docFree: (doc) => symbols.hk_doc_free(doc),
    docInsertStr: (doc, key, value) => symbols.hk_doc_insert_str(doc, toC(key), toC(value)),
    docInsertInt: (doc, key, value) => symbols.hk_doc_insert_int(doc, toC(key), BigInt(value)),
    docInsertFloat: (doc, key, value) => symbols.hk_doc_insert_float(doc, toC(key), value),
    docInsertBool: (doc, key, value) => symbols.hk_doc_insert_bool(doc, toC(key), value),
    docInsertNull: (doc, key) => symbols.hk_doc_insert_null(doc, toC(key)),
    docInsertBin: (doc, key, bytes) => symbols.hk_doc_insert_bin(doc, toC(key), bytes, bytes.byteLength),
    docInsertTimestamp: (doc, key, micros) => symbols.hk_doc_insert_timestamp(doc, toC(key), micros),
    docInsertServerTimestamp: (doc, key) => symbols.hk_doc_insert_server_timestamp(doc, toC(key)),
    docInsertReference: (doc, key, tc, tid) => symbols.hk_doc_insert_reference(doc, toC(key), toC(tc), toC(tid)),
    docToJson: (doc) => ptrToStringAndFree(symbols.hk_doc_to_json(doc)),

    engineInsert: (engine, collection, docId, doc) => symbols.hk_engine_insert(engine, toC(collection), toC(docId), doc),
    engineGet: (engine, collection, docId) => symbols.hk_engine_get(engine, toC(collection), toC(docId)),
    engineDelete: (engine, collection, docId) => symbols.hk_engine_delete(engine, toC(collection), toC(docId)),
    engineDeleteLocal: (engine, collection, docId) => symbols.hk_engine_delete_local(engine, toC(collection), toC(docId)),
    engineSetCollectionLocal: (engine, collection, local) => symbols.hk_engine_set_collection_local(engine, toC(collection), local),
    engineReplicateKey: (engine, collection, docId) => symbols.hk_engine_replicate_key(engine, toC(collection), toC(docId)),
    engineReplicateCollection: (engine, collection) => symbols.hk_engine_replicate_collection(engine, toC(collection)),
    engineVacuumCollection: (engine, collection) => symbols.hk_engine_vacuum_collection(engine, toC(collection)),
    enginePatch: (engine, collection, docId, updates) => symbols.hk_engine_patch(engine, toC(collection), toC(docId), updates),
    engineInsertSubDoc: (engine, col, id, subCol, subId, doc) => symbols.hk_engine_insert_subdoc(engine, toC(col), toC(id), toC(subCol), toC(subId), doc),
    engineGetByRef: (engine, doc, fieldKey) => symbols.hk_engine_get_by_ref(engine, doc, toC(fieldKey)),
    engineCreateIndex: (engine, collection, fieldsJson) => symbols.hk_engine_create_index(engine, toC(collection), toC(fieldsJson)),

    batchNew: () => symbols.hk_batch_new(),
    batchFree: (batch) => symbols.hk_batch_free(batch),
    batchSet: (batch, collection, docId, doc) => symbols.hk_batch_set(batch, toC(collection), toC(docId), doc),
    batchDelete: (batch, collection, docId) => symbols.hk_batch_delete(batch, toC(collection), toC(docId)),
    batchCommit: (engine, batch) => symbols.hk_batch_commit(engine, batch),

    transactionBegin: (engine) => symbols.hk_transaction_begin(engine),
    transactionGet: (engine, tx, collection, docId) => symbols.hk_transaction_get(engine, tx, toC(collection), toC(docId)),
    transactionSet: (tx, collection, docId, doc) => symbols.hk_transaction_set(tx, toC(collection), toC(docId), doc),
    transactionCommit: (engine, tx) => symbols.hk_transaction_commit(engine, tx),
    transactionFree: (tx) => symbols.hk_transaction_free(tx),

    queryNew: (collection) => symbols.hk_query_new(toC(collection)),
    queryFree: (query) => symbols.hk_query_free(query),
    queryWhereEqStr: (query, field, value) => symbols.hk_query_where_eq_str(query, toC(field), toC(value)),
    queryWhereEqBool: (query, field, value) => symbols.hk_query_where_eq_bool(query, toC(field), value),
    queryWhereEqInt: (query, field, value) => symbols.hk_query_where_eq_int(query, toC(field), BigInt(value)),
    queryWhereNeStr: (query, field, value) => symbols.hk_query_where_ne_str(query, toC(field), toC(value)),
    queryWhereNeInt: (query, field, value) => symbols.hk_query_where_ne_int(query, toC(field), BigInt(value)),
    queryWhereGtStr: (query, field, value) => symbols.hk_query_where_gt_str(query, toC(field), toC(value)),
    queryWhereGtInt: (query, field, value) => symbols.hk_query_where_gt_int(query, toC(field), BigInt(value)),
    queryWhereGteStr: (query, field, value) => symbols.hk_query_where_gte_str(query, toC(field), toC(value)),
    queryWhereGteInt: (query, field, value) => symbols.hk_query_where_gte_int(query, toC(field), BigInt(value)),
    queryWhereLtStr: (query, field, value) => symbols.hk_query_where_lt_str(query, toC(field), toC(value)),
    queryWhereLtInt: (query, field, value) => symbols.hk_query_where_lt_int(query, toC(field), BigInt(value)),
    queryWhereLteStr: (query, field, value) => symbols.hk_query_where_lte_str(query, toC(field), toC(value)),
    queryWhereLteInt: (query, field, value) => symbols.hk_query_where_lte_int(query, toC(field), BigInt(value)),
    queryWhereMatch: (query, field, value) => symbols.hk_query_where_match(query, toC(field), toC(value)),
    queryWhereMatchPrefix: (query, field, value) => symbols.hk_query_where_match_prefix(query, toC(field), toC(value)),
    queryWhereContains: (query, field, value) => symbols.hk_query_where_contains(query, toC(field), toC(value)),
    queryWhereStartsWith: (query, field, value) => symbols.hk_query_where_starts_with(query, toC(field), toC(value)),
    queryWhereOrStr: (query, field, value) => symbols.hk_query_where_or_str(query, toC(field), toC(value)),
    queryWhereOrInt: (query, field, value) => symbols.hk_query_where_or_int(query, toC(field), BigInt(value)),
    queryOrderBy: (query, field, asc) => symbols.hk_query_order_by(query, toC(field), asc),
    queryLimit: (query, limit) => symbols.hk_query_limit(query, limit),
    queryOffset: (query, offset) => symbols.hk_query_offset(query, offset),
    querySelectField: (query, field) => symbols.hk_query_select_field(query, toC(field)),
    queryExecute: (engine, query) => ptrToStringAndFree(symbols.hk_query_execute(engine, query)),
    queryDelete: (engine, query) => symbols.hk_query_delete(engine, query),
    queryDeleteLocal: (engine, query) => symbols.hk_query_delete_local(engine, query),
    queryPatch: (engine, query, patchDoc) => symbols.hk_query_patch(engine, query, patchDoc),
    queryExecuteToHandles: (engine, query) => symbols.hk_query_execute_to_handles(engine, query),
    resultSetCount: (results) => symbols.hk_result_set_count(results),
    resultSetGetDoc: (results, index) => symbols.hk_result_set_get_doc(results, index),
    resultSetFree: (results) => symbols.hk_result_set_free(results),
    resultSetToJson: (results) => ptrToStringAndFree(symbols.hk_result_set_to_json(results)),
    queryExecuteRaw: (engine, query) => symbols.hk_query_execute_raw(engine, query),
    rawResultCount: (results) => symbols.hk_rawresult_count(results),
    rawResultGet: (results, index) => symbols.hk_rawresult_get(results, index),
    rawResultFree: (results) => symbols.hk_rawresult_free(results),
    queryStartAfterRaw: (query, anchorRawDoc) => symbols.hk_query_start_after_raw(query, anchorRawDoc),
    rawDocToDoc: (engine, rawDoc, collection) => symbols.hk_rawdoc_to_doc(engine, rawDoc, toC(collection)),
    viewGet: (engine, collection, docId) => symbols.hk_view_get(engine, toC(collection), toC(docId)),
    viewFree: (view) => symbols.hk_view_free(view),
    viewFieldCount: (view) => symbols.hk_view_field_count(view),
    viewHasField: (view, key) => symbols.hk_view_has_field(view, toC(key)),
    viewGetInt: (view, key) => {
      const out = new BigInt64Array(1);
      return symbols.hk_view_get_int(view, toC(key), ptrOf(out)) ? out[0] : null;
    },
    viewGetFloat: (view, key) => {
      const out = new Float64Array(1);
      return symbols.hk_view_get_float(view, toC(key), ptrOf(out)) ? out[0] : null;
    },
    viewGetBool: (view, key) => {
      const r = symbols.hk_view_get_bool(view, toC(key));
      return r < 0 ? null : r !== 0;
    },
    viewToDoc: (view, docId) => symbols.hk_view_to_doc(view, toC(docId)),
    queryDeferBlobs: (query, defer) => symbols.hk_query_defer_blobs(query, defer ? 1 : 0),
    docResolveBlobs: (engine, collection, doc) => symbols.hk_doc_resolve_blobs(engine, toC(collection), doc),
    engineInsertTake: (engine, collection, docId, doc) => symbols.hk_engine_insert_take(engine, toC(collection), toC(docId), doc),
    configSetWalReserveBytes: (c, bytes) => symbols.hk_config_set_wal_reserve_bytes(c, bytes),

    queryAggregateCount: (q) => symbols.hk_query_aggregate_count(q),
    queryAggregateSum: (q, f) => symbols.hk_query_aggregate_sum(q, toC(f)),
    queryAggregateAvg: (q, f) => symbols.hk_query_aggregate_avg(q, toC(f)),
    queryExecuteAggregation: (e, q) => ptrToStringAndFree(symbols.hk_query_execute_aggregation(e, q)),
    engineListCollections: (engine) => ptrToStringAndFree(symbols.hk_engine_list_collections(engine)),
    netSyncerNew: (engine, name, roomKey) => symbols.hk_net_syncer_new(engine, toC(name), toC(roomKey)),
    netSyncerStart: (syncer, port) => symbols.hk_net_syncer_start(syncer, port),
    netSyncerSetDiscovery: (syncer, mode) => symbols.hk_net_syncer_set_discovery(syncer, mode),
    netSyncerStatus: (syncer) => ptrToStringAndFree(symbols.hk_net_syncer_status(syncer)),
    netSyncerFree: (syncer) => symbols.hk_net_syncer_free(syncer),

    cloudSyncNew: (engine, mode, clientId, roomName, roomKey, authToken) => symbols.hk_cloud_sync_new(engine, mode, toC(clientId), toC(roomName), toC(roomKey), toC(authToken)),
    cloudSyncServerNew: (engine, serverId, authToken) => symbols.hk_cloud_sync_server_new(engine, toC(serverId), toC(authToken)),
    cloudSyncClientNew: (engine, clientId, roomName, roomKey, authToken) => symbols.hk_cloud_sync_client_new(engine, toC(clientId), toC(roomName), toC(roomKey), toC(authToken)),
    cloudSyncStart: (cs, address) => symbols.hk_cloud_sync_start(cs, toC(address)),
    cloudSyncStatus: (cs) => ptrToStringAndFree(symbols.hk_cloud_sync_status(cs)),
    cloudSyncStop: (cs) => symbols.hk_cloud_sync_stop(cs),
    cloudSyncFree: (cs) => symbols.hk_cloud_sync_free(cs),

    // ================= v0.5.9 =================

    // Indexing
    createFtsIndex: (engine, collection, field) => symbols.hk_engine_create_fts_index(engine, toC(collection), toC(field)),
    createSimpleIndex: (engine, collection, field) => symbols.hk_engine_create_simple_index(engine, toC(collection), toC(field)),

    // Array API
    arrayNew: () => symbols.hk_array_new(),
    arrayFree: (arr) => symbols.hk_array_free(arr),
    arrayAppendStr: (arr, value) => symbols.hk_array_append_str(arr, toC(value)),
    arrayAppendInt: (arr, value) => symbols.hk_array_append_int(arr, BigInt(value)),
    arrayAppendDoc: (arr, doc) => symbols.hk_array_append_doc(arr, doc),

    // Nested
    docInsertDoc: (parent, key, child) => symbols.hk_doc_insert_doc(parent, toC(key), child),
    docInsertArray: (parent, key, arr) => symbols.hk_doc_insert_array(parent, toC(key), arr),

    // Query extensions
    queryWhereIn: (query, field, arr) => symbols.hk_query_where_in(query, toC(field), arr),
    queryWhereNotIn: (query, field, arr) => symbols.hk_query_where_not_in(query, toC(field), arr),
    queryWhereArrayContainsAny: (query, field, arr) => symbols.hk_query_where_array_contains_any(query, toC(field), arr),
    queryWhereArrayContainsStr: (query, field, value) => symbols.hk_query_where_array_contains(query, toC(field), toC(String(value))),
    queryWhereArrayContainsInt: (query, field, value) => symbols.hk_query_where_array_contains(query, toC(field), toC(String(value))),
    queryStartAfter: (query, anchorDoc) => symbols.hk_query_start_after(query, anchorDoc),
    queryStartAt: (query, anchorDoc) => symbols.hk_query_start_at(query, anchorDoc),
    queryEndAt: (query, anchorDoc) => symbols.hk_query_end_at(query, anchorDoc),
    queryEndBefore: (query, anchorDoc) => symbols.hk_query_end_before(query, anchorDoc),

    lastError: () => {
      const ptr = symbols.hk_last_error();
      return ptr ? new CString(ptr).toString() : 'unknown ffi error';
    }
  };
}

async function createNodeBindings(libPath: string): Promise<NativeBindings> {
  const koffiModule = await import('koffi');
  const koffi: any = (koffiModule as any).default ?? koffiModule;
  const lib = koffi.load(libPath);

  // ponytail: koffi needs opaque struct declarations up front — without
  // these EVERY struct-typed decl throws at bindings creation, i.e. the
  // node backend was dead on arrival (bun resolves pointers structurally
  // and never noticed). Declared once here for all present and future fns.
  for (const t of ['HK_Array', 'HK_Batch', 'HK_CloudSync', 'HK_Config', 'HK_Doc', 'HK_Engine', 'HK_NetSyncer', 'HK_Query', 'HK_RawDoc', 'HK_RawResultSet', 'HK_ResultSet', 'HK_Transaction', 'HK_ViewDoc', 'HK_Watch']) koffi.opaque(t);

  // ponytail: owned C strings (Rust-allocated) must come back through a
  // DISPOSABLE type wired to hk_string_free — never bare char* (koffi
  // auto-decodes to a JS string and the native buffer leaks) and never
  // default koffi.free (wrong allocator: Rust memory freed by C free is
  // UB). Declared before the table; the closure runs post-init.
  const flStringFreeRaw = lib.func('void hk_string_free(void* value)');
  const HeapStr = koffi.disposable('HeapStr', 'str', (ptr: any) => { flStringFreeRaw(ptr); });

  // Canonical callback signature (matches HK_OnSnapshotCallback in
  // firelite.h). Kept as documentation; register() below takes the
  // typedef NAME as a string, not this proto object.
  const OnSnapshotCB = koffi.proto('void HK_OnSnapshotCallback(const char *collection, const char *path, int32_t kind, void *user_data)');

  const fn = {
    hk_engine_open: lib.func('HK_Engine* hk_engine_open(const char* path)'),
    hk_engine_is_indexes_ready: lib.func('bool hk_engine_is_indexes_ready(HK_Engine* engine)'),
    hk_engine_open_with_config: lib.func('HK_Engine* hk_engine_open_with_config(const char* path, HK_Config* config)'),
    hk_engine_free: lib.func('void hk_engine_free(HK_Engine* engine)'),
    hk_engine_backup: lib.func('int hk_engine_backup(HK_Engine* engine, const char* path)'),
    hk_engine_compact: lib.func('int hk_engine_compact(HK_Engine* engine)'),
    // ponytail: owned-string returns are HeapStr (auto-freed via
    // hk_string_free by the disposable — never bare char*, which leaks,
    // and never default koffi.free (wrong allocator for Rust memory).
    // hk_last_error stays char* (TLS, never freed).
    hk_engine_get_stats: lib.func('HeapStr hk_engine_get_stats(HK_Engine* engine)'),
    hk_engine_get_audit_log: lib.func('HeapStr hk_engine_get_audit_log(HK_Engine* engine)'),
    hk_engine_snapshot_indices: lib.func('int hk_engine_snapshot_indices(HK_Engine* engine)'),
    hk_engine_list_indexes: lib.func('HeapStr hk_engine_list_indexes(HK_Engine* engine, const char* collection)'),

    hk_config_new: lib.func('HK_Config* hk_config_new()'),
    hk_config_free: lib.func('void hk_config_free(HK_Config* config)'),
    hk_config_set_durability: lib.func('void hk_config_set_durability(HK_Config* config, int32_t mode)'),
    hk_config_set_encryption_key: lib.func('void hk_config_set_encryption_key(HK_Config* config, const char* key)'),
    hk_config_set_encrypted_collections: lib.func('int hk_config_set_encrypted_collections(HK_Config* config, const char* collections_json)'),
    hk_config_set_audit_log: lib.func('void hk_config_set_audit_log(HK_Config* config, bool enabled, const char* path)'),
    hk_config_set_query_workers: lib.func('void hk_config_set_query_workers(HK_Config* config, size_t count)'),
    hk_config_set_memory_limits: lib.func('void hk_config_set_memory_limits(HK_Config* config, size_t mmap_size, size_t max_inlined_bytes)'),
    hk_config_set_storage_tuning: lib.func('void hk_config_set_storage_tuning(HK_Config* config, size_t page_size, size_t compaction_threshold, size_t group_commit_max_ops)'),
    hk_config_set_blob_threshold: lib.func('void hk_config_set_blob_threshold(HK_Config* config, size_t threshold_bytes)'),
    hk_config_set_compression: lib.func('void hk_config_set_compression(HK_Config* config, bool enabled, int32_t level)'),
    hk_config_set_background_maintenance: lib.func('void hk_config_set_background_maintenance(HK_Config* config, bool enabled)'),

    hk_engine_watch: lib.func('HK_Watch* hk_engine_watch(HK_Engine* engine, const char* collection, HK_OnSnapshotCallback* callback, void* user_data)'),
    hk_watch_free: lib.func('void hk_watch_free(HK_Watch* watch)'),

    hk_doc_new: lib.func('HK_Doc* hk_doc_new()'),
    hk_doc_free: lib.func('void hk_doc_free(HK_Doc* doc)'),
    hk_doc_insert_str: lib.func('int hk_doc_insert_str(HK_Doc* doc, const char* key, const char* value)'),
    hk_doc_insert_int: lib.func('int hk_doc_insert_int(HK_Doc* doc, const char* key, int64_t value)'),
    hk_doc_insert_float: lib.func('int hk_doc_insert_float(HK_Doc* doc, const char* key, double value)'),
    hk_doc_insert_bool: lib.func('int hk_doc_insert_bool(HK_Doc* doc, const char* key, bool value)'),
    hk_doc_insert_null: lib.func('int hk_doc_insert_null(HK_Doc* doc, const char* key)'),
    hk_doc_insert_bin: lib.func('int hk_doc_insert_bin(HK_Doc* doc, const char* key, const uint8_t* data, size_t len)'),
    hk_doc_insert_timestamp: lib.func('int hk_doc_insert_timestamp(HK_Doc* doc, const char* key, int64_t micros)'),
    hk_doc_insert_server_timestamp: lib.func('int hk_doc_insert_server_timestamp(HK_Doc* doc, const char* key)'),
    hk_doc_to_json: lib.func('HeapStr hk_doc_to_json(const HK_Doc* doc)'),

    hk_engine_insert: lib.func('int hk_engine_insert(HK_Engine* engine, const char* collection, const char* doc_id, const HK_Doc* doc)'),
    hk_engine_get: lib.func('HK_Doc* hk_engine_get(HK_Engine* engine, const char* collection, const char* doc_id)'),
    hk_engine_delete: lib.func('int hk_engine_delete(HK_Engine* engine, const char* collection, const char* doc_id)'),
    hk_engine_delete_local: lib.func('int hk_engine_delete_local(HK_Engine* engine, const char* collection, const char* doc_id)'),
    hk_engine_set_collection_local: lib.func('int hk_engine_set_collection_local(HK_Engine* engine, const char* collection, int local)'),
    hk_engine_replicate_key: lib.func('int hk_engine_replicate_key(HK_Engine* engine, const char* collection, const char* doc_id)'),
    hk_engine_replicate_collection: lib.func('int hk_engine_replicate_collection(HK_Engine* engine, const char* collection)'),
    hk_engine_vacuum_collection: lib.func('int hk_engine_vacuum_collection(HK_Engine* engine, const char* collection)'),
    hk_engine_patch: lib.func('int hk_engine_patch(HK_Engine* engine, const char* collection, const char* doc_id, const HK_Doc* updates)'),
    hk_engine_insert_subdoc: lib.func('int hk_engine_insert_subdoc(HK_Engine* engine, const char* col, const char* id, const char* sub_col, const char* sub_id, const HK_Doc* doc)'),
    hk_engine_get_by_ref: lib.func('HK_Doc* hk_engine_get_by_ref(HK_Engine* engine, const HK_Doc* doc, const char* field_key)'),
    hk_engine_create_index: lib.func('uint32_t hk_engine_create_index(HK_Engine* engine, const char* collection, const char* fields_json)'),

    hk_batch_new: lib.func('HK_Batch* hk_batch_new()'),
    hk_batch_free: lib.func('void hk_batch_free(HK_Batch* batch)'),
    hk_batch_set: lib.func('int hk_batch_set(HK_Batch* batch, const char* collection, const char* doc_id, const HK_Doc* doc)'),
    hk_batch_delete: lib.func('int hk_batch_delete(HK_Batch* batch, const char* collection, const char* doc_id)'),
    hk_batch_commit: lib.func('int hk_batch_commit(HK_Engine* engine, HK_Batch* batch)'),

    hk_transaction_begin: lib.func('HK_Transaction* hk_transaction_begin(HK_Engine* engine)'),
    hk_transaction_get: lib.func('HK_Doc* hk_transaction_get(HK_Engine* engine, HK_Transaction* tx, const char* collection, const char* doc_id)'),
    hk_transaction_set: lib.func('int hk_transaction_set(HK_Transaction* tx, const char* collection, const char* doc_id, const HK_Doc* doc)'),
    hk_transaction_commit: lib.func('int hk_transaction_commit(HK_Engine* engine, HK_Transaction* tx)'),
    hk_transaction_free: lib.func('void hk_transaction_free(HK_Transaction* tx)'),

    hk_query_new: lib.func('HK_Query* hk_query_new(const char* collection)'),
    hk_query_free: lib.func('void hk_query_free(HK_Query* query)'),
    hk_query_where_eq_str: lib.func('int hk_query_where_eq_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_eq_bool: lib.func('int hk_query_where_eq_bool(HK_Query* query, const char* field, bool value)'),
    hk_query_where_eq_int: lib.func('int hk_query_where_eq_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_ne_str: lib.func('int hk_query_where_ne_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_ne_int: lib.func('int hk_query_where_ne_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_gt_str: lib.func('int hk_query_where_gt_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_gt_int: lib.func('int hk_query_where_gt_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_gte_str: lib.func('int hk_query_where_gte_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_gte_int: lib.func('int hk_query_where_gte_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_lt_str: lib.func('int hk_query_where_lt_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_lt_int: lib.func('int hk_query_where_lt_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_lte_str: lib.func('int hk_query_where_lte_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_lte_int: lib.func('int hk_query_where_lte_int(HK_Query* query, const char* field, int64_t value)'),
    hk_query_where_match: lib.func('int hk_query_where_match(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_match_prefix: lib.func('int hk_query_where_match_prefix(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_contains: lib.func('int hk_query_where_contains(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_starts_with: lib.func('int hk_query_where_starts_with(HK_Query* query, const char* field, const char* value)'),
    hk_query_order_by: lib.func('int hk_query_order_by(HK_Query* query, const char* field, bool ascending)'),
    hk_query_limit: lib.func('int hk_query_limit(HK_Query* query, size_t limit)'),
    hk_query_offset: lib.func('int hk_query_offset(HK_Query* query, size_t offset)'),
    hk_query_select_field: lib.func('int hk_query_select_field(HK_Query* query, const char* field)'),
    hk_query_execute: lib.func('HeapStr hk_query_execute(HK_Engine* engine, const HK_Query* query)'),
    hk_query_delete: lib.func('int hk_query_delete(HK_Engine* engine, HK_Query* query)'),
    hk_query_delete_local: lib.func('int hk_query_delete_local(HK_Engine* engine, HK_Query* query)'),
    hk_query_patch: lib.func('int hk_query_patch(HK_Engine* engine, HK_Query* query, const HK_Doc* patch_doc)'),
    hk_query_execute_to_handles: lib.func('HK_ResultSet* hk_query_execute_to_handles(HK_Engine* engine, const HK_Query* query)'),
    hk_result_set_count: lib.func('size_t hk_result_set_count(HK_ResultSet* results)'),
    hk_result_set_get_doc: lib.func('HK_Doc* hk_result_set_get_doc(HK_ResultSet* results, size_t index)'),
    hk_result_set_free: lib.func('void hk_result_set_free(HK_ResultSet* results)'),
    hk_result_set_to_json: lib.func('HeapStr hk_result_set_to_json(HK_ResultSet* results)'),
    hk_query_execute_raw: lib.func('HK_RawResultSet* hk_query_execute_raw(HK_Engine* engine, const HK_Query* query)'),
    hk_rawresult_count: lib.func('size_t hk_rawresult_count(HK_RawResultSet* results)'),
    hk_rawresult_get: lib.func('HK_RawDoc* hk_rawresult_get(HK_RawResultSet* results, size_t index)'),
    hk_rawresult_free: lib.func('void hk_rawresult_free(HK_RawResultSet* results)'),
    hk_query_start_after_raw: lib.func('int hk_query_start_after_raw(HK_Query* query, const HK_RawDoc* anchor_doc)'),
    hk_rawdoc_to_doc: lib.func('HK_Doc* hk_rawdoc_to_doc(HK_Engine* engine, const HK_RawDoc* raw_doc, const char* collection)'),
    hk_view_get: lib.func('HK_ViewDoc* hk_view_get(HK_Engine* engine, const char* collection, const char* doc_id)'),
    hk_view_free: lib.func('void hk_view_free(HK_ViewDoc* view)'),
    hk_view_field_count: lib.func('size_t hk_view_field_count(const HK_ViewDoc* view)'),
    hk_view_has_field: lib.func('bool hk_view_has_field(const HK_ViewDoc* view, const char* key)'),
    hk_view_get_int: lib.func('bool hk_view_get_int(const HK_ViewDoc* view, const char* key, _Out_ int64_t *out)'),
    hk_view_get_float: lib.func('bool hk_view_get_float(const HK_ViewDoc* view, const char* key, _Out_ double *out)'),
    hk_view_get_bool: lib.func('int hk_view_get_bool(const HK_ViewDoc* view, const char* key)'),
    hk_view_to_doc: lib.func('HK_Doc* hk_view_to_doc(const HK_ViewDoc* view, const char* doc_id)'),
    hk_query_defer_blobs: lib.func('int hk_query_defer_blobs(HK_Query* query, int defer)'),
    hk_doc_resolve_blobs: lib.func('int hk_doc_resolve_blobs(HK_Engine* engine, const char* collection, HK_Doc* doc)'),
    hk_engine_insert_take: lib.func('int hk_engine_insert_take(HK_Engine* engine, const char* collection, const char* doc_id, HK_Doc* doc)'),
    hk_config_set_wal_reserve_bytes: lib.func('void hk_config_set_wal_reserve_bytes(HK_Config* config, uint64_t bytes)'),

    hk_query_aggregate_count: lib.func('int hk_query_aggregate_count(HK_Query* query)'),
    hk_query_aggregate_sum: lib.func('int hk_query_aggregate_sum(HK_Query* query, const char* field)'),
    hk_query_aggregate_avg: lib.func('int hk_query_aggregate_avg(HK_Query* query, const char* field)'),
    hk_query_execute_aggregation: lib.func('HeapStr hk_query_execute_aggregation(HK_Engine* engine, const HK_Query* query)'),
    hk_query_where_or_str: lib.func('int hk_query_where_or_str(HK_Query* query, const char* field, const char* value)'),
    hk_query_where_or_int: lib.func('int hk_query_where_or_int(HK_Query* query, const char* field, int64_t value)'),

    hk_engine_list_collections: lib.func('HeapStr hk_engine_list_collections(HK_Engine* engine)'),
    hk_net_syncer_new: lib.func('HK_NetSyncer* hk_net_syncer_new(HK_Engine* engine, const char* name, const char* room_key)'),
    hk_net_syncer_start: lib.func('int hk_net_syncer_start(HK_NetSyncer* syncer, uint16_t port)'),
    hk_net_syncer_set_discovery: lib.func('int hk_net_syncer_set_discovery(HK_NetSyncer* syncer, int mode)'),
    hk_net_syncer_status: lib.func('HeapStr hk_net_syncer_status(HK_NetSyncer* syncer)'),
    hk_net_syncer_free: lib.func('void hk_net_syncer_free(HK_NetSyncer* syncer)'),

    // v0.5.9
    // Indexing
    hk_engine_create_fts_index: lib.func('int hk_engine_create_fts_index(HK_Engine* engine, const char* collection, const char* field)'),
    hk_engine_create_simple_index: lib.func('int hk_engine_create_simple_index(HK_Engine* engine, const char* collection, const char* field)'),

    // Array API
    hk_array_new: lib.func('HK_Array* hk_array_new()'),
    hk_array_free: lib.func('void hk_array_free(HK_Array* arr)'),
    hk_array_append_str: lib.func('int hk_array_append_str(HK_Array* arr, const char* value)'),
    hk_array_append_int: lib.func('int hk_array_append_int(HK_Array* arr, int64_t value)'),
    hk_array_append_doc: lib.func('int hk_array_append_doc(HK_Array* arr, const HK_Doc* doc)'),

    // Nested
    hk_doc_insert_doc: lib.func('int hk_doc_insert_doc(HK_Doc* parent, const char* key, HK_Doc* child)'),
    hk_doc_insert_array: lib.func('int hk_doc_insert_array(HK_Doc* parent, const char* key, HK_Array* arr)'),

    // Query extensions
    hk_query_where_in: lib.func('int hk_query_where_in(HK_Query* query, const char* field, HK_Array* arr)'),
    hk_query_where_not_in: lib.func('int hk_query_where_not_in(HK_Query* query, const char* field, HK_Array* arr)'),
    hk_query_where_array_contains_any: lib.func('int hk_query_where_array_contains_any(HK_Query* query, const char* field, HK_Array* arr)'),
    hk_query_where_array_contains: lib.func('int hk_query_where_array_contains(HK_Query* query, const char* field, const char* value)'),
    hk_query_start_after: lib.func('int hk_query_start_after(HK_Query* query, HK_Doc* anchor)'),
    hk_query_start_at: lib.func('int hk_query_start_at(HK_Query* query, const HK_Doc* anchor)'),
    hk_query_end_at: lib.func('int hk_query_end_at(HK_Query* query, const HK_Doc* anchor)'),
    hk_query_end_before: lib.func('int hk_query_end_before(HK_Query* query, const HK_Doc* anchor)'),

    hk_doc_insert_reference: lib.func('int hk_doc_insert_reference(HK_Doc* doc, const char* key, const char* target_collection, const char* target_id)'),

    hk_cloud_sync_new: lib.func('HK_CloudSync* hk_cloud_sync_new(HK_Engine* engine, int32_t mode, const char* client_id, const char* room_name, const char* room_key, const char* auth_token)'),
    hk_cloud_sync_server_new: lib.func('HK_CloudSync* hk_cloud_sync_server_new(HK_Engine* engine, const char* server_id, const char* auth_token)'),
    hk_cloud_sync_client_new: lib.func('HK_CloudSync* hk_cloud_sync_client_new(HK_Engine* engine, const char* client_id, const char* room_name, const char* room_key, const char* auth_token)'),
    hk_cloud_sync_start: lib.func('int hk_cloud_sync_start(HK_CloudSync* cloud_sync, const char* address)'),
    hk_cloud_sync_status: lib.func('HeapStr hk_cloud_sync_status(HK_CloudSync* cloud_sync)'),
    hk_cloud_sync_stop: lib.func('void hk_cloud_sync_stop(HK_CloudSync* cloud_sync)'),
    hk_cloud_sync_free: lib.func('void hk_cloud_sync_free(HK_CloudSync* cloud_sync)'),

    hk_last_error: lib.func('const char* hk_last_error()'),
    hk_string_free: lib.func('void hk_string_free(void* value)')
  };

  // ponytail: HeapStr returns arrive as JS strings, ALREADY freed via
  // hk_string_free by the disposable — no decode, no manual free (both
  // crash or leak: decode on externals segfaults, freeing a copy leaks).
  const ptrToStringAndFree = (s: any): string | null => {
    if (!s) return null;
    return s as string;
  };

  return {
    engineOpen: (path) => fn.hk_engine_open(path),
    engineIsIndexesReady: (engine) => fn.hk_engine_is_indexes_ready(engine),
    engineOpenWithConfig: (path, config) => fn.hk_engine_open_with_config(path, config),
    engineFree: (engine) => fn.hk_engine_free(engine),
    engineBackup: (e, p) => fn.hk_engine_backup(e, p),
    engineCompact: (e) => fn.hk_engine_compact(e),
    engineGetStats: (e) => ptrToStringAndFree(fn.hk_engine_get_stats(e)),
    engineGetAuditLog: (e) => ptrToStringAndFree(fn.hk_engine_get_audit_log(e)),
    engineSnapshotIndices: (e) => fn.hk_engine_snapshot_indices(e),
    engineListIndexes: (e, c) => ptrToStringAndFree(fn.hk_engine_list_indexes(e, c ?? null)),

    configNew: () => fn.hk_config_new(),
    configFree: (c) => fn.hk_config_free(c),
    configSetDurability: (c, m) => fn.hk_config_set_durability(c, m),
    configSetEncryptionKey: (c, k) => fn.hk_config_set_encryption_key(c, k),
    configSetEncryptedCollections: (c, json) => fn.hk_config_set_encrypted_collections(c, json),
    configSetAuditLog: (c, e, p) => fn.hk_config_set_audit_log(c, e, p),
    configSetQueryWorkers: (c, count) => fn.hk_config_set_query_workers(c, count),
    configSetMemoryLimits: (c, m, mi) => fn.hk_config_set_memory_limits(c, m, mi),
    configSetStorageTuning: (c, ps, th, gc) => fn.hk_config_set_storage_tuning(c, ps, th, gc),
    configSetBlobThreshold: (c, t) => fn.hk_config_set_blob_threshold(c, t),
    configSetCompression: (c, e, l) => fn.hk_config_set_compression(c, e, l),
    configSetBackgroundMaintenance: (c, e) => fn.hk_config_set_background_maintenance(c, e),

    engineWatch: (engine, collection, callback) => {
      const wrapper = (c: string, p: string, kind: number, _user: any) => callback(c, p, kind);
      // ponytail: koffi.register takes the typedef NAME as a string here —
      // passing the proto object itself throws "Unexpected ... type".
      return fn.hk_engine_watch(engine, collection, koffi.register(wrapper, 'HK_OnSnapshotCallback *'), null);
    },
    watchFree: (watch) => fn.hk_watch_free(watch),

    docNew: () => fn.hk_doc_new(),
    docFree: (doc) => fn.hk_doc_free(doc),
    docInsertStr: (doc, key, value) => fn.hk_doc_insert_str(doc, key, value),
    docInsertInt: (doc, key, value) => fn.hk_doc_insert_int(doc, key, value),
    docInsertFloat: (doc, key, value) => fn.hk_doc_insert_float(doc, key, value),
    docInsertBool: (doc, key, value) => fn.hk_doc_insert_bool(doc, key, value),
    docInsertNull: (doc, key) => fn.hk_doc_insert_null(doc, key),
    docInsertBin: (doc, key, bytes) => fn.hk_doc_insert_bin(doc, key, Buffer.from(bytes), bytes.byteLength),
    docInsertTimestamp: (doc, key, micros) => fn.hk_doc_insert_timestamp(doc, key, micros),
    docInsertServerTimestamp: (doc, key) => fn.hk_doc_insert_server_timestamp(doc, key),
    docInsertReference: (doc, key, tc, tid) => fn.hk_doc_insert_reference(doc, key, tc, tid),
    docToJson: (doc) => ptrToStringAndFree(fn.hk_doc_to_json(doc)),

    engineInsert: (engine, collection, docId, doc) => fn.hk_engine_insert(engine, collection, docId, doc),
    engineGet: (engine, collection, docId) => fn.hk_engine_get(engine, collection, docId),
    engineDelete: (engine, collection, docId) => fn.hk_engine_delete(engine, collection, docId),
    engineDeleteLocal: (engine, collection, docId) => fn.hk_engine_delete_local(engine, collection, docId),
    engineSetCollectionLocal: (engine, collection, local) => fn.hk_engine_set_collection_local(engine, collection, local),
    engineReplicateKey: (engine, collection, docId) => fn.hk_engine_replicate_key(engine, collection, docId),
    engineReplicateCollection: (engine, collection) => fn.hk_engine_replicate_collection(engine, collection),
    engineVacuumCollection: (engine, collection) => fn.hk_engine_vacuum_collection(engine, collection),
    enginePatch: (engine, collection, docId, updates) => fn.hk_engine_patch(engine, collection, docId, updates),
    engineInsertSubDoc: (engine, col, id, subCol, subId, doc) => fn.hk_engine_insert_subdoc(engine, col, id, subCol, subId, doc),
    engineGetByRef: (engine, doc, fieldKey) => fn.hk_engine_get_by_ref(engine, doc, fieldKey),
    engineCreateIndex: (engine, collection, fieldsJson) => fn.hk_engine_create_index(engine, collection, fieldsJson),

    batchNew: () => fn.hk_batch_new(),
    batchFree: (batch) => fn.hk_batch_free(batch),
    batchSet: (batch, collection, docId, doc) => fn.hk_batch_set(batch, collection, docId, doc),
    batchDelete: (batch, collection, docId) => fn.hk_batch_delete(batch, collection, docId),
    batchCommit: (engine, batch) => fn.hk_batch_commit(engine, batch),

    transactionBegin: (engine) => fn.hk_transaction_begin(engine),
    transactionGet: (engine, tx, collection, docId) => fn.hk_transaction_get(engine, tx, collection, docId),
    transactionSet: (tx, collection, docId, doc) => fn.hk_transaction_set(tx, collection, docId, doc),
    transactionCommit: (engine, tx) => fn.hk_transaction_commit(engine, tx),
    transactionFree: (tx) => fn.hk_transaction_free(tx),

    queryNew: (collection) => fn.hk_query_new(collection),
    queryFree: (query) => fn.hk_query_free(query),
    queryWhereEqStr: (query, field, value) => fn.hk_query_where_eq_str(query, field, value),
    queryWhereEqBool: (query, field, value) => fn.hk_query_where_eq_bool(query, field, value),
    queryWhereEqInt: (query, field, value) => fn.hk_query_where_eq_int(query, field, value),
    queryWhereNeStr: (query, field, value) => fn.hk_query_where_ne_str(query, field, value),
    queryWhereNeInt: (query, field, value) => fn.hk_query_where_ne_int(query, field, value),
    queryWhereGtStr: (query, field, value) => fn.hk_query_where_gt_str(query, field, value),
    queryWhereGtInt: (query, field, value) => fn.hk_query_where_gt_int(query, field, value),
    queryWhereGteStr: (query, field, value) => fn.hk_query_where_gte_str(query, field, value),
    queryWhereGteInt: (query, field, value) => fn.hk_query_where_gte_int(query, field, value),
    queryWhereLtStr: (query, field, value) => fn.hk_query_where_lt_str(query, field, value),
    queryWhereLtInt: (query, field, value) => fn.hk_query_where_lt_int(query, field, value),
    queryWhereLteStr: (query, field, value) => fn.hk_query_where_lte_str(query, field, value),
    queryWhereLteInt: (query, field, value) => fn.hk_query_where_lte_int(query, field, value),
    queryWhereMatch: (query, field, value) => fn.hk_query_where_match(query, field, value),
    queryWhereMatchPrefix: (query, field, value) => fn.hk_query_where_match_prefix(query, field, value),
    queryWhereContains: (query, field, value) => fn.hk_query_where_contains(query, field, value),
    queryWhereStartsWith: (query, field, value) => fn.hk_query_where_starts_with(query, field, value),
    queryWhereOrStr: (query, field, value) => fn.hk_query_where_or_str(query, field, value),
    queryWhereOrInt: (query, field, value) => fn.hk_query_where_or_int(query, field, value),
    queryOrderBy: (query, field, asc) => fn.hk_query_order_by(query, field, asc),
    queryLimit: (query, limit) => fn.hk_query_limit(query, limit),
    queryOffset: (query, offset) => fn.hk_query_offset(query, offset),
    querySelectField: (query, field) => fn.hk_query_select_field(query, field),
    queryExecute: (engine, query) => ptrToStringAndFree(fn.hk_query_execute(engine, query)),
    queryDelete: (engine, query) => fn.hk_query_delete(engine, query),
    queryDeleteLocal: (engine, query) => fn.hk_query_delete_local(engine, query),
    queryPatch: (engine, query, patchDoc) => fn.hk_query_patch(engine, query, patchDoc),
    queryExecuteToHandles: (engine, query) => fn.hk_query_execute_to_handles(engine, query),
    resultSetCount: (results) => fn.hk_result_set_count(results),
    resultSetGetDoc: (results, index) => fn.hk_result_set_get_doc(results, index),
    resultSetFree: (results) => fn.hk_result_set_free(results),
    resultSetToJson: (results) => ptrToStringAndFree(fn.hk_result_set_to_json(results)),
    queryExecuteRaw: (engine, query) => fn.hk_query_execute_raw(engine, query),
    rawResultCount: (results) => fn.hk_rawresult_count(results),
    rawResultGet: (results, index) => fn.hk_rawresult_get(results, index),
    rawResultFree: (results) => fn.hk_rawresult_free(results),
    queryStartAfterRaw: (query, anchorRawDoc) => fn.hk_query_start_after_raw(query, anchorRawDoc),
    rawDocToDoc: (engine, rawDoc, collection) => fn.hk_rawdoc_to_doc(engine, rawDoc, collection),
    viewGet: (engine, collection, docId) => fn.hk_view_get(engine, collection, docId),
    viewFree: (view) => fn.hk_view_free(view),
    viewFieldCount: (view) => fn.hk_view_field_count(view),
    viewHasField: (view, key) => fn.hk_view_has_field(view, key),
    viewGetInt: (view, key) => {
      const out: bigint[] = [0n];
      return fn.hk_view_get_int(view, key, out) ? out[0] : null;
    },
    viewGetFloat: (view, key) => {
      const out: number[] = [0];
      return fn.hk_view_get_float(view, key, out) ? out[0] : null;
    },
    viewGetBool: (view, key) => {
      const r: number = fn.hk_view_get_bool(view, key);
      return r < 0 ? null : r !== 0;
    },
    viewToDoc: (view, docId) => fn.hk_view_to_doc(view, docId),
    queryDeferBlobs: (query, defer) => fn.hk_query_defer_blobs(query, defer ? 1 : 0),
    docResolveBlobs: (engine, collection, doc) => fn.hk_doc_resolve_blobs(engine, collection, doc),
    engineInsertTake: (engine, collection, docId, doc) => fn.hk_engine_insert_take(engine, collection, docId, doc),
    configSetWalReserveBytes: (c, bytes) => fn.hk_config_set_wal_reserve_bytes(c, bytes),

    queryAggregateCount: (q) => fn.hk_query_aggregate_count(q),
    queryAggregateSum: (q, f) => fn.hk_query_aggregate_sum(q, f),
    queryAggregateAvg: (q, f) => fn.hk_query_aggregate_avg(q, f),
    queryExecuteAggregation: (e, q) => ptrToStringAndFree(fn.hk_query_execute_aggregation(e, q)),
    engineListCollections: (engine) => ptrToStringAndFree(fn.hk_engine_list_collections(engine)),
    netSyncerNew: (engine, name, roomKey) => fn.hk_net_syncer_new(engine, name, roomKey),
    netSyncerStart: (syncer, port) => fn.hk_net_syncer_start(syncer, port),
    netSyncerSetDiscovery: (syncer, mode) => fn.hk_net_syncer_set_discovery(syncer, mode),
    netSyncerStatus: (syncer) => ptrToStringAndFree(fn.hk_net_syncer_status(syncer)),
    netSyncerFree: (syncer) => fn.hk_net_syncer_free(syncer),

    cloudSyncNew: (engine, mode, clientId, roomName, roomKey, authToken) => fn.hk_cloud_sync_new(engine, mode, clientId, roomName, roomKey, authToken),
    cloudSyncServerNew: (engine, serverId, authToken) => fn.hk_cloud_sync_server_new(engine, serverId, authToken),
    cloudSyncClientNew: (engine, clientId, roomName, roomKey, authToken) => fn.hk_cloud_sync_client_new(engine, clientId, roomName, roomKey, authToken),
    cloudSyncStart: (cs, address) => fn.hk_cloud_sync_start(cs, address),
    cloudSyncStatus: (cs) => ptrToStringAndFree(fn.hk_cloud_sync_status(cs)),
    cloudSyncStop: (cs) => fn.hk_cloud_sync_stop(cs),
    cloudSyncFree: (cs) => fn.hk_cloud_sync_free(cs),

    // ================= v0.5.9 =================

    // Indexing
    createFtsIndex: (engine, collection, field) => fn.hk_engine_create_fts_index(engine, collection, field),
    createSimpleIndex: (engine, collection, field) => fn.hk_engine_create_simple_index(engine, collection, field),

    // Array API
    arrayNew: () => fn.hk_array_new(),
    arrayFree: (arr) => fn.hk_array_free(arr),
    arrayAppendStr: (arr, value) => fn.hk_array_append_str(arr, value),
    arrayAppendInt: (arr, value) => fn.hk_array_append_int(arr, value),
    arrayAppendDoc: (arr, doc) => fn.hk_array_append_doc(arr, doc),

    // Nested
    docInsertDoc: (parent, key, child) => fn.hk_doc_insert_doc(parent, key, child),
    docInsertArray: (parent, key, arr) => fn.hk_doc_insert_array(parent, key, arr),

    // Query extensions
    queryWhereIn: (query, field, arr) => fn.hk_query_where_in(query, field, arr),
    queryWhereNotIn: (query, field, arr) => fn.hk_query_where_not_in(query, field, arr),
    queryWhereArrayContainsAny: (query, field, arr) => fn.hk_query_where_array_contains_any(query, field, arr),
    queryWhereArrayContainsStr: (query, field, value) => fn.hk_query_where_array_contains(query, field, String(value)),
    queryWhereArrayContainsInt: (query, field, value) => fn.hk_query_where_array_contains(query, field, String(value)),
    queryStartAfter: (query, anchorDoc) => fn.hk_query_start_after(query, anchorDoc),
    queryStartAt: (query, anchorDoc) => fn.hk_query_start_at(query, anchorDoc),
    queryEndAt: (query, anchorDoc) => fn.hk_query_end_at(query, anchorDoc),
    queryEndBefore: (query, anchorDoc) => fn.hk_query_end_before(query, anchorDoc),

    lastError: () => (fn.hk_last_error() as string) || 'unknown ffi error'
  };
}

export async function loadNativeBindings(explicitPath?: string): Promise<NativeBindings> {
  const libPath = resolveLibraryPath(explicitPath);
  // return isBunRuntime() ? createBunBindings(libPath) : createNodeBindings(libPath);

  // 1. Check for Bun
  if (typeof (globalThis as any).Bun !== 'undefined') {
    return createBunBindings(libPath);
  }

  // 2. Check for Node.js (via process)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return createNodeBindings(libPath);
  }

  throw new Error("FireLite Native Bindings are only supported in Node.js or Bun environments. For browsers, use the Tauri Gateway.");
}
