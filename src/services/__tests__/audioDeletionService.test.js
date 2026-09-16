import { describe, it } from 'node:test';
import assert from 'node:assert';
import { deleteAudioResource } from '../audioDeletionService.js';

describe('Service de Suppression Résiliente Audio (audioDeletionService)', () => {
  it('lève une erreur si l\'élément est nul ou sans identifiant', async () => {
    await assert.rejects(
      async () => await deleteAudioResource(null),
      /L'élément à supprimer doit comporter un identifiant valide/
    );
    await assert.rejects(
      async () => await deleteAudioResource({}),
      /L'élément à supprimer doit comporter un identifiant valide/
    );
  });

  it('supprime avec succès via storagePath et supprime le document Firestore', async () => {
    let deletedStoragePath = null;
    let deletedDocCollection = null;
    let deletedDocId = null;

    const mockItem = {
      id: 'preset_123',
      storagePath: 'documents/group_abc/sequencer/12345_groove.mp3'
    };

    const result = await deleteAudioResource(mockItem, {
      collection: 'presets',
      _ref: (_storage, path) => ({ path }),
      _doc: (_db, col, id) => ({ _col: col, _id: id }),
      _deleteObject: async (refObj) => {
        deletedStoragePath = refObj.path;
      },
      _deleteDoc: async (docRef) => {
        deletedDocCollection = docRef._col;
        deletedDocId = docRef._id;
      },
      dbInstance: {
        _isMockDb: true
      },
      storageInstance: {
        _isMockStorage: true
      }
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.storageDeleted, true);
    assert.strictEqual(result.firestoreDeleted, true);
    assert.strictEqual(deletedStoragePath, 'documents/group_abc/sequencer/12345_groove.mp3');
  });

  it('supprime avec succès via audioUrl (refFromURL)', async () => {
    let deletedStorageUrl = null;

    const mockItem = {
      id: 'preset_456',
      audioUrl: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/bounce.mp3?alt=media'
    };

    const mockStorage = {
      refFromURL: (url) => ({ url })
    };

    const result = await deleteAudioResource(mockItem, {
      collection: 'rhythms',
      storageInstance: mockStorage,
      _deleteObject: async (refObj) => {
        deletedStorageUrl = refObj.url;
      },
      _deleteDoc: async () => {}
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.storageDeleted, true);
    assert.strictEqual(result.firestoreDeleted, true);
    assert.strictEqual(result.collection, 'rhythms');
    assert.strictEqual(deletedStorageUrl, mockItem.audioUrl);
  });

  it('intercepte les erreurs Storage (404/not-found) et garantit la suppression Firestore', async () => {
    let firestoreCalled = false;

    const mockItem = {
      id: 'old_track_789',
      storagePath: 'documents/group_abc/sequencer/non_existent.wav'
    };

    const result = await deleteAudioResource(mockItem, {
      collection: 'presets',
      _ref: (_storage, path) => ({ path }),
      _deleteObject: async () => {
        const error = new Error('storage/object-not-found');
        error.code = 'storage/object-not-found';
        throw error;
      },
      _deleteDoc: async () => {
        firestoreCalled = true;
      }
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.storageDeleted, false); // Échec silencieux
    assert.strictEqual(result.firestoreDeleted, true); // Garanti
    assert.strictEqual(firestoreCalled, true);
  });

  it('déduit la collection selon options.collection ou item.collection', async () => {
    const mockItem1 = { id: 'rhythm_1', collection: 'rhythms' };
    const res1 = await deleteAudioResource(mockItem1, {
      _deleteDoc: async () => {}
    });
    assert.strictEqual(res1.collection, 'rhythms');

    const mockItem2 = { id: 'preset_2' };
    const res2 = await deleteAudioResource(mockItem2, {
      collectionName: 'presets',
      _deleteDoc: async () => {}
    });
    assert.strictEqual(res2.collection, 'presets');
  });

  it('supprime les anciens fichiers audio type storage via le groupId', async () => {
    let targetedStoragePath = null;

    const mockItem = {
      id: '1690000000_maracatu_bounce.mp3',
      type: 'storage'
    };

    const result = await deleteAudioResource(mockItem, {
      groupId: 'maracatu_groupe_1',
      _ref: (_storage, path) => {
        targetedStoragePath = path;
        return { path };
      },
      _deleteObject: async () => {},
      _deleteDoc: async () => {}
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.storageDeleted, true);
    assert.strictEqual(targetedStoragePath, 'documents/maracatu_groupe_1/sequencer/1690000000_maracatu_bounce.mp3');
  });

  it('applique un marquage de secours isDeleted si deleteDoc échoue', async () => {
    let fallbackUpdateCalled = false;

    const mockItem = { id: 'protected_doc' };

    const result = await deleteAudioResource(mockItem, {
      _deleteDoc: async () => {
        throw new Error('permission-denied');
      },
      _updateDoc: async (_ref, data) => {
        if (data.isDeleted === true) {
          fallbackUpdateCalled = true;
        }
      }
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.firestoreDeleted, true);
    assert.strictEqual(fallbackUpdateCalled, true);
  });
});
