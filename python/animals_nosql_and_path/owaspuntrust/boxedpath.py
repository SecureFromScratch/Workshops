"""  
The `BoxedPath` and `Sandbox` classes are designed to handle file system paths within a constrained environment, often referred to as a "sandbox." This approach is commonly used to enhance security by restricting an application's access to only a specific subset of the file system, thereby preventing it from accessing or manipulating files outside of the designated area. Here's a summary of the purpose and usage of each class:
Both `BoxedPath` and `Sandbox` are used to maintain a secure environment where operations are tightly controlled and restricted to a specific directory path, protecting the wider file system from unauthorized access or modification. They would be especially useful in applications that execute untrusted code, deal with user-uploaded files, or require strict file system access controls for security reasons.
"""

import os
import pathlib

class _PreprocessedRealpath:
  # _PreprocessedRealpath is a wrapper used to prevent processing of path with realpath method
  _realpath: str

  def __init__(self, _realpath: str):
    self._realpath = _realpath

  def __str__(self):
    return self._realpath

class BoxedPath:
  """  
  Represents a file system path while enforcing that it remains within a specified "sandbox" directory. Any attempts to create a `BoxedPath` that resolves to a location outside of this sandbox directory result in a `PermissionError`.
  - **Usage**:
    - An instance of `BoxedPath` is created by providing a path (`_path`) and a sandbox path (`_sandbox`). The sandbox path defines the constrained area within the file system.
    - The class checks whether the provided path is within the sandbox using the `_validateConstraint` method. This method compares the real (absolute) paths to ensure the target path isn't outside the sandbox directory.
    - The `__truediv__` method allows the `BoxedPath` to be joined with another path segment using the `/` operator, returning a new `BoxedPath` object that is also validated to be within the sandbox.
    - The `open` and `stat` methods are utility methods that allow the user to perform operations equivalent to the built-in `open` and `os.stat` functions on the path represented by the `BoxedPath` instance.
    - The `insecureUnrestrainedRealpath` method is a way to retrieve the real path (absolute path) of the `_unrestrained` attribute, but it should be used cautiously as it bypasses the sandbox restriction.
  - **Example**: 
    path = BoxedPath('/abc/def/ghi', '/abc/def') / 'zyx'
    parts = [ 'zyx', 'qwe', 'rty' ]
    path = path / parts
  """
  _unrestrained: pathlib.Path
  _sandbox_real_path: str

  @classmethod
  def _validateConstraint(cls, _path: pathlib.Path, _sandbox_real_path: str):
    if os.path.commonpath([os.path.realpath(_path), _sandbox_real_path]) != _sandbox_real_path:
      err = OSError()
      err.strerror = f"Path {os.path.realpath(_path)} outside of sandbox {_sandbox_real_path}"
      err.filename = _path
      err.filename2 = os.path.realpath(_path)
      raise PermissionError(err)
                    
  def __init__(self, _path: str | os.PathLike, _sandbox: str | os.PathLike | _PreprocessedRealpath):
    self._unrestrained = pathlib.Path(_path)
    if isinstance(_sandbox, _PreprocessedRealpath):
      self._sandbox_real_path = str(_sandbox)
    else:
      self._sandbox_real_path = os.path.realpath(_sandbox)

    BoxedPath._validateConstraint(self._unrestrained, self._sandbox_real_path)

  def __str__(self):
    return str(self._unrestrained)
  
  def __eq__(self, _other):
    if not isinstance(_other, BoxedPath):
        return NotImplemented
    return self._unrestrained == _other._unrestrained
  
  def __hash__(self):
    return self._unrestrained.__hash__()
  
  def __truediv__(self, key):
      try:
        new_path = self._unrestrained / key
      except TypeError: # key is not a PathLike object
        if not hasattr(key, '__iter__'):
          raise TypeError("expected str, bytes, os.PathLike object, or collection of those, "
                            "not " + str(type(key)))
        # Support for concatenating an iterable collection of PathLike objects
        new_path = self._unrestrained
        for pathpart in key:
          try:
            new_path = new_path / pathpart
          except:
            raise TypeError("Within collection, expected each element to be a str, bytes, or os.PathLike object, "
                              "not " + str(type(pathpart)))
      if not new_path:
        return None

      BoxedPath._validateConstraint(new_path, self._sandbox_real_path)
      return BoxedPath(new_path, _PreprocessedRealpath(self._sandbox_real_path))

  def __rtruediv__(self, key):
    return NotImplemented
  
  #def __fspath__(self):
  #  return self._unrestrained
  
  def open(self, *args, **kwargs):
    return open(self._unrestrained, *args, **kwargs)

  def stat(self):
    return self._unrestrained.stat()

  def exists(self):
    return self._unrestrained.exists()
  
  @property
  def parent(self):
    parent = self._unrestrained.parent
    # no need to validate - __init__ does that. 
    # BoxedPath._validateConstraint(parent, self._sandbox_real_path)
    return BoxedPath(parent, _PreprocessedRealpath(self._sandbox_real_path))

  @property
  def parent_or_base(self):
    parent = self._unrestrained.parent
    try:
      BoxedPath._validateConstraint(parent, self._sandbox_real_path)
    except:
      return BoxedPath(self._sandbox_real_path, _PreprocessedRealpath(self._sandbox_real_path))
    return BoxedPath(parent, _PreprocessedRealpath(self._sandbox_real_path))

  @property
  def relative_to_base(self):
    return pathlib.Path(os.path.realpath(self._unrestrained)).relative_to(self._sandbox_real_path).__str__()

  """ Returns the real path, with no constraints """  
  def insecure_unrestrained_realpath(self):
    return os.path.realpath(self._unrestrained)

class Sandbox(BoxedPath):
  """
  A specialized version of `BoxedPath` where the initial path and the sandbox are the same. It represents the root of a sandboxed environment.
  - **Usage**:
    - An instance of `Sandbox` is created by providing only one path (`_sandbox`), which sets both the path and the sandbox to the same directory, effectively defining the root of the sandbox.
    - Since `Sandbox` inherits from `BoxedPath`, it carries all the methods and validations of `BoxedPath`, ensuring that any operations are constrained within the sandboxed environment.
  - **Example**: 
    path = Sandbox('/abc/def') / 'ghi' / 'zyx'
    parts = [ 'zyx', 'qwe', 'rty' ]
    path = path / parts
  """
  def __init__(self, _sandbox: str | os.PathLike):
    super().__init__(_sandbox, _sandbox)

  def join(self, _path, *_paths):
    if isinstance(_path, BoxedPath):
      _path = _path._unrestrained
    total_path = os.path.join(_path, *_paths)
    BoxedPath._validateConstraint(total_path, self._sandbox_real_path)
    return total_path
